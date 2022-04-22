/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from "chai";
import { GobyProvider } from "../../../../xch/providers/goby/goby_provider";

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

// eslint-disable-next-line max-len
const THE_OFFER = "offer1qqp83w76wzru6cmqvpsxygqqz6wmkl7tdje0sxkfedqa6ae4pa0kpyq3zc24a902we30lrynhslk5jnqafsvzwj6e7xavuar7hwxs0fhtt8s6apaquh0v9s5m5aep48ww0jl92sajvtycj8ttzuvu5vmj9ecd8hc7jzs26m0wn0mjq64ymamm70kkwwk0jnt6066amwadafk52ket03v806ha5hlh8uapewqkt9psh5x3hgfalfrzsnyzmktj4356ln02lml352hwlaha2jc24vudl4kvc46z0s6fc9qwpt4slfw2ryjd2wapatjjzm785j8xwmu7ewurkv83aaggnpeygah6ede6lncqwuvnnlehxzlzzssce8puj32pkvmwwlte6fc0t7ud9mfku76vzrgm6k4ww857r724u67pt706v62xfd4c5m5u7hdha9pvhr2mh7x8vpzvwa9uc0dsu6dgjgwndzncg7q7uzae5lx7022w57ec777vzpnwnymykmwe3y3j2e2v00hhu0mj27d4p28n4wsljp025sr7yfjw4talvz29m3lkmgr8yvhlmm7el8jzhx3hrwqtgdjq606l7p9mrcuj00w7r0talw9xewz8e3ejc80q7yhjwcllly2c04h4r4w0l87etl564vep4sft2etj6mlhwt9fcxmuv09tlwg28wn447v7nvulvumdeargz4tdplzv0h0ln0v9fhypffklutke2y5euer50d8yrhgfvlmmedunl0t3m8an30ssqnjk2ups9mc8nqdpxsz47llpvf08l5ynskn77k7l2c8tnn9a9d48egv0eky6ety0g2tzjrgu8fh7k3durq9c0d9hwrn2mj85lgvv8hdv5dutpzm7lm9ecl6wc7h06getv57hnlufv2dyt4ufuukl8rtkfqlkdnn44wzfeutkhdh7kr204ykswew7gl8z4wf7674zyfj8f5e8ta4m4c865mfrmu0538jxyhndxd9rutrma6whkeecxgqnakdn6s3q0vx5";

describe("GobyProvider", () => {
    describe("contructor", () => {
        it("Works if Goby is not present", () => {
            const p = new GobyProvider(
                true,
                {
                    isGoby: false,
                    request: async ({ method, params }: { method: string, params?: any }) => {
                        // do nothing
                    },
                    on: async (event: string, callback: any) => {
                        // fo nothing
                    }
                }
            );

            expect(p.isConnected()).to.be.false;
        });

        it("Works if Goby is present, but not connected", () => {
            let requestedAccounts: boolean = false;

            const p = new GobyProvider(
                true,
                {
                    isGoby: true,
                    request: async ({ method, params }: { method: string, params?: any }) => {
                        requestedAccounts = method === "accounts";
                        return [];
                    },
                    on: async (event: string, callback: any) => {
                        // fo nothing
                    }
                }
            );

            expect(p.isConnected()).to.be.false;
            expect(requestedAccounts).to.be.true;
        });

        it("Does not interact with Goby if tryNonInteractiveConnect is set to false", () => {
            let interacted: boolean = false;

            const p = new GobyProvider(
                false,
                {
                    isGoby: true,
                    request: async ({ method, params }: { method: string, params?: any }) => {
                        interacted = true;
                        return [];
                    },
                    on: async (event: string, callback: any) => {
                        interacted = true;
                    }
                }
            );

            expect(p.isConnected()).to.be.false;
            expect(interacted).to.be.false;
        });

        it("Works if Goby is present and already connected", async () => {
            let requestedAccounts: boolean = false;
            let registeredCallbacks: number = 0;

            const p = new GobyProvider(
                true,
                {
                    isGoby: true,
                    request: async ({ method, params }: { method: string, params?: any }) => {
                        requestedAccounts = true;
                        return ["xch1k6mv3caj73akwp0ygpqhjpat20mu3akc3f6xdrc5ahcqkynl7ejq2z74n3"];
                    },
                    on: (event: string, callback: any) => {
                        registeredCallbacks += 1;
                    }
                }
            );

            let counter = 0;
            while(counter < 20 && (!requestedAccounts || registeredCallbacks < 2)) {
                counter++;
                await sleep(100);
            }

            expect(p.isConnected()).to.be.true;
            expect(requestedAccounts).to.be.true;
            expect(registeredCallbacks).to.equal(2);
            expect(await p.getAddress()).to.equal("xch1k6mv3caj73akwp0ygpqhjpat20mu3akc3f6xdrc5ahcqkynl7ejq2z74n3");
        });
    });

    describe("connect()", () => {
        it("Works if Goby is not present", async () => {
            let requestAccountsCalled: boolean = false;

            const p = new GobyProvider(
                true,
                {
                    isGoby: false,
                    request: async ({ method, params }: { method: string, params?: any }) => {
                        if(method === "requestAccounts") {
                            requestAccountsCalled = true;
                        }
                        return [];
                    },
                    on: async (event: string, callback: any) => {
                        // fo nothing
                    }
                }
            );
            await p.connect();

            expect(p.isConnected()).to.be.false;
            expect(requestAccountsCalled).to.be.false;
        });

        it("Works if Goby is present, but returns empty list of accounts", async () => {
            let requestAccountsCalled: boolean = false;

            const p = new GobyProvider(
                true,
                {
                    isGoby: true,
                    request: async ({ method, params }: { method: string, params?: any }) => {
                        if(method === "requestAccounts") {
                            requestAccountsCalled = true;
                        }
                        return [];
                    },
                    on: async (event: string, callback: any) => {
                        // fo nothing
                    }
                }
            );
            await p.connect();

            expect(p.isConnected()).to.be.false;
            expect(requestAccountsCalled).to.be.true;
        });

        it("Works if Goby is present, but user rejects the request", async () => {
            let requestAccountsCalled: boolean = false;

            const p = new GobyProvider(
                true,
                {
                    isGoby: true,
                    request: async ({ method, params }: { method: string, params?: any }) => {
                        if(method === "requestAccounts") {
                            requestAccountsCalled = true;
                            throw new Error("User rejected the request.");
                        }
                        return [];
                    },
                    on: async (event: string, callback: any) => {
                        // fo nothing
                    }
                }
            );
            await p.connect();

            expect(p.isConnected()).to.be.false;
            expect(requestAccountsCalled).to.be.true;
        });

        it("Works if Goby is present and the user accepts the request", async () => {
            let requestAccountsCalled: boolean = false;
            let registeredCallbacks: number = 0;

            const p = new GobyProvider(
                true,
                {
                    isGoby: true,
                    request: async ({ method, params }: { method: string, params?: any }) => {
                        if(method === "requestAccounts") {
                            requestAccountsCalled = true;
                            return ["xch1k6mv3caj73akwp0ygpqhjpat20mu3akc3f6xdrc5ahcqkynl7ejq2z74n3"];
                        }
                        return [];
                    },
                    on: async (event: string, callback: any) => {
                        registeredCallbacks += 1;
                    }
                }
            );
            await p.connect();

            expect(p.isConnected()).to.be.true;
            expect(requestAccountsCalled).to.be.true;
            expect(await p.getAddress()).to.equal("xch1k6mv3caj73akwp0ygpqhjpat20mu3akc3f6xdrc5ahcqkynl7ejq2z74n3");
            expect(registeredCallbacks).to.equal(2);
        });

        it("Works if Goby is present and already connected", async () => {
            let accounts: boolean = false;
            let registeredCallbacks: number = 0;
            let requestedAccounts: boolean = false;

            const p = new GobyProvider(
                true,
                {
                    isGoby: true,
                    request: async ({ method, params }: { method: string, params?: any }) => {
                        if(method === "accounts") {
                            accounts = true;
                            return ["xch1k6mv3caj73akwp0ygpqhjpat20mu3akc3f6xdrc5ahcqkynl7ejq2z74n3"];
                        }
                        if(method === "requestAccounts") {
                            requestedAccounts = true;
                        }
                        return [];
                    },
                    on: (event: string, callback: any) => {
                        registeredCallbacks += 1;
                    }
                }
            );

            let counter = 0;
            while(counter < 20 && (!accounts || registeredCallbacks < 2)) {
                counter++;
                await sleep(100);
            }

            expect(p.isConnected()).to.be.true;
            expect(accounts).to.be.true;
            expect(registeredCallbacks).to.equal(2);
            expect(await p.getAddress()).to.equal("xch1k6mv3caj73akwp0ygpqhjpat20mu3akc3f6xdrc5ahcqkynl7ejq2z74n3");
            expect(requestedAccounts).to.be.false;

            await p.connect();

            expect(p.isConnected()).to.be.true;
            expect(accounts).to.be.true;
            expect(registeredCallbacks).to.equal(2);
            expect(await p.getAddress()).to.equal("xch1k6mv3caj73akwp0ygpqhjpat20mu3akc3f6xdrc5ahcqkynl7ejq2z74n3");
            expect(requestedAccounts).to.be.false;
        });
    });

    describe("close()", () => {
        it("Works if connected via constructor", async () => {
            let requestedAccounts: boolean = false;
            let registeredCallbacks: number = 0;

            const p = new GobyProvider(
                true,
                {
                    isGoby: true,
                    request: async ({ method, params }: { method: string, params?: any }) => {
                        requestedAccounts = true;
                        return ["xch1k6mv3caj73akwp0ygpqhjpat20mu3akc3f6xdrc5ahcqkynl7ejq2z74n3"];
                    },
                    on: (event: string, callback: any) => {
                        registeredCallbacks += 1;
                    }
                }
            );

            let counter = 0;
            while(counter < 20 && (!requestedAccounts || registeredCallbacks < 2)) {
                counter++;
                await sleep(100);
            }

            expect(p.isConnected()).to.be.true;
            expect(requestedAccounts).to.be.true;
            expect(registeredCallbacks).to.equal(2);
            expect(await p.getAddress()).to.equal("xch1k6mv3caj73akwp0ygpqhjpat20mu3akc3f6xdrc5ahcqkynl7ejq2z74n3");

            await p.close();

            expect(p.isConnected()).to.be.false;
            expect(await p.getAddress()).to.equal("");
        });

        it("Works if connected via connect()", async () => {
            let requestAccountsCalled: boolean = false;
            let registeredCallbacks: number = 0;

            const p = new GobyProvider(
                true,
                {
                    isGoby: true,
                    request: async ({ method, params }: { method: string, params?: any }) => {
                        if(method === "requestAccounts") {
                            requestAccountsCalled = true;
                            return ["xch1k6mv3caj73akwp0ygpqhjpat20mu3akc3f6xdrc5ahcqkynl7ejq2z74n3"];
                        }
                        return [];
                    },
                    on: async (event: string, callback: any) => {
                        registeredCallbacks += 1;
                    }
                }
            );
            await p.connect();

            expect(p.isConnected()).to.be.true;
            expect(requestAccountsCalled).to.be.true;
            expect(await p.getAddress()).to.equal("xch1k6mv3caj73akwp0ygpqhjpat20mu3akc3f6xdrc5ahcqkynl7ejq2z74n3");
            expect(registeredCallbacks).to.equal(2);

            await p.close();

            expect(p.isConnected()).to.be.false;
            expect(await p.getAddress()).to.equal("");
        });

        it("Works if used when not connected", async () => {
            let requestAccountsCalled: boolean = false;
            let registeredCallbacks: number = 0;

            const p = new GobyProvider(
                true,
                {
                    isGoby: true,
                    request: async ({ method, params }: { method: string, params?: any }) => {
                        if(method === "requestAccounts") {
                            requestAccountsCalled = true;
                            return ["xch1k6mv3caj73akwp0ygpqhjpat20mu3akc3f6xdrc5ahcqkynl7ejq2z74n3"];
                        }
                        return [];
                    },
                    on: async (event: string, callback: any) => {
                        registeredCallbacks += 1;
                    }
                }
            );
            await p.connect();

            expect(p.isConnected()).to.be.true;
            expect(requestAccountsCalled).to.be.true;
            expect(await p.getAddress()).to.equal("xch1k6mv3caj73akwp0ygpqhjpat20mu3akc3f6xdrc5ahcqkynl7ejq2z74n3");
            expect(registeredCallbacks).to.equal(2);

            await p.close();

            expect(p.isConnected()).to.be.false;
            expect(await p.getAddress()).to.equal("");

            await p.close();

            expect(p.isConnected()).to.be.false;
            expect(await p.getAddress()).to.equal("");
        });
    });

    describe("getNetworkId()", () => {
        it("Works if not connected", async () => {
            const p = new GobyProvider(
                false,
                {
                    isGoby: true,
                    request: async ({ method, params }: { method: string, params?: any }) => {
                        // do nothing
                    },
                    on: (event: string, callback: any) => {
                        // do nothing
                    }
                }
            );

            expect(p.isConnected()).to.be.false;
            expect(p.getNetworkId()).to.equal("");
        });

        it("Works if not connected, after connect", async () => {
            const p = new GobyProvider(
                false,
                {
                    isGoby: true,
                    request: async ({ method, params }: { method: string, params?: any }) => {
                        if(method === "requestAccounts") {
                            throw new Error("User rejected the request.");
                        }
                    },
                    on: (event: string, callback: any) => {
                        // do nothing
                    }
                }
            );

            await p.connect();

            expect(p.isConnected()).to.be.false;
            expect(p.getNetworkId()).to.equal("");
        });

        it("Works if connected via constructor (default value)", async () => {
            let requestedAccounts: boolean = false;
            let registeredCallbacks: number = 0;

            const p = new GobyProvider(
                true,
                {
                    isGoby: true,
                    request: async ({ method, params }: { method: string, params?: any }) => {
                        requestedAccounts = true;
                        return ["xch1k6mv3caj73akwp0ygpqhjpat20mu3akc3f6xdrc5ahcqkynl7ejq2z74n3"];
                    },
                    on: (event: string, callback: any) => {
                        registeredCallbacks += 1;
                    }
                }
            );

            let counter = 0;
            while(counter < 20 && (!requestedAccounts || registeredCallbacks < 2)) {
                counter++;
                await sleep(100);
            }

            expect(p.isConnected()).to.be.true;
            expect(requestedAccounts).to.be.true;
            expect(registeredCallbacks).to.equal(2);
            expect(await p.getAddress()).to.equal("xch1k6mv3caj73akwp0ygpqhjpat20mu3akc3f6xdrc5ahcqkynl7ejq2z74n3");

            expect(p.getNetworkId()).to.equal("mainnet");
        });

        it("Works if connected via connect()", async () => {
            let requestAccountsCalled: boolean = false;
            let registeredCallbacks: number = 0;

            const p = new GobyProvider(
                true,
                {
                    isGoby: true,
                    request: async ({ method, params }: { method: string, params?: any }) => {
                        if(method === "requestAccounts") {
                            requestAccountsCalled = true;
                            return ["xch1k6mv3caj73akwp0ygpqhjpat20mu3akc3f6xdrc5ahcqkynl7ejq2z74n3"];
                        }
                        return [];
                    },
                    on: async (event: string, callback: any) => {
                        registeredCallbacks += 1;
                    }
                }
            );
            await p.connect();

            expect(p.isConnected()).to.be.true;
            expect(requestAccountsCalled).to.be.true;
            expect(await p.getAddress()).to.equal("xch1k6mv3caj73akwp0ygpqhjpat20mu3akc3f6xdrc5ahcqkynl7ejq2z74n3");
            expect(registeredCallbacks).to.equal(2);

            expect(p.getNetworkId()).to.equal("mainnet");
        });

        it("Works if 'chainChanged' event callback is fired", async () => {
            let requestAccountsCalled: boolean = false;
            let registeredCallbacks: number = 0;
            let chainChangedCallback: any;

            const p = new GobyProvider(
                true,
                {
                    isGoby: true,
                    request: async ({ method, params }: { method: string, params?: any }) => {
                        if(method === "requestAccounts") {
                            requestAccountsCalled = true;
                            return ["xch1k6mv3caj73akwp0ygpqhjpat20mu3akc3f6xdrc5ahcqkynl7ejq2z74n3"];
                        }
                        return [];
                    },
                    on: async (event: string, callback: any) => {
                        registeredCallbacks += 1;
                        if(event === "chainChanged") {
                            chainChangedCallback = callback;
                        }
                    }
                }
            );
            await p.connect();

            expect(p.isConnected()).to.be.true;
            expect(requestAccountsCalled).to.be.true;
            expect(await p.getAddress()).to.equal("xch1k6mv3caj73akwp0ygpqhjpat20mu3akc3f6xdrc5ahcqkynl7ejq2z74n3");
            expect(registeredCallbacks).to.equal(2);

            expect(p.getNetworkId()).to.equal("mainnet");

            await chainChangedCallback("yakuhito");
            expect(p.getNetworkId()).to.equal("yakuhito");

            await chainChangedCallback("yakuhito2");
            expect(p.getNetworkId()).to.equal("yakuhito2");

            await chainChangedCallback("mainnet");
            expect(p.getNetworkId()).to.equal("mainnet");

            await chainChangedCallback("0x2");
            expect(p.getNetworkId()).to.equal("testnet10");

            await chainChangedCallback("0x1");
            expect(p.getNetworkId()).to.equal("mainnet");

            await chainChangedCallback(0x2);
            expect(p.getNetworkId()).to.equal("testnet10");

            await chainChangedCallback(0x1);
            expect(p.getNetworkId()).to.equal("mainnet");

            await chainChangedCallback("lasttest");
            expect(p.getNetworkId()).to.equal("lasttest");
        });
    });

    describe("isConnected()", () => {
        it("Works if not connected", async () => {
            const p = new GobyProvider(
                false,
                {
                    isGoby: true,
                    request: async ({ method, params }: { method: string, params?: any }) => {
                        // do nothing
                    },
                    on: (event: string, callback: any) => {
                        // do nothing
                    }
                }
            );

            expect(p.isConnected()).to.be.false;
        });

        it("Works if not connected, after connect", async () => {
            const p = new GobyProvider(
                false,
                {
                    isGoby: true,
                    request: async ({ method, params }: { method: string, params?: any }) => {
                        if(method === "requestAccounts") {
                            throw new Error("User rejected the request.");
                        }
                    },
                    on: (event: string, callback: any) => {
                        // do nothing
                    }
                }
            );

            await p.connect();

            expect(p.isConnected()).to.be.false;
        });

        it("Works if connected via connect()", async () => {
            const p = new GobyProvider(
                true,
                {
                    isGoby: true,
                    request: async ({ method, params }: { method: string, params?: any }) => {
                        if(method === "requestAccounts") {
                            return ["xch1k6mv3caj73akwp0ygpqhjpat20mu3akc3f6xdrc5ahcqkynl7ejq2z74n3"];
                        }
                        return [];
                    },
                    on: async (event: string, callback: any) => {
                        // do nothing
                    }
                }
            );
            await p.connect();

            expect(p.isConnected()).to.be.true;
        });

        it("Works if connect(), close() are used", async () => {
            const p = new GobyProvider(
                true,
                {
                    isGoby: true,
                    request: async ({ method, params }: { method: string, params?: any }) => {
                        if(method === "requestAccounts") {
                            return ["xch1k6mv3caj73akwp0ygpqhjpat20mu3akc3f6xdrc5ahcqkynl7ejq2z74n3"];
                        }
                        return [];
                    },
                    on: async (event: string, callback: any) => {
                        // do nothing
                    }
                }
            );

            await p.connect();
            expect(p.isConnected()).to.be.true;

            await p.close();
            expect(p.isConnected()).to.be.false;
        });

        it("Works if connect(), close(), connect() are used", async () => {
            const p = new GobyProvider(
                true,
                {
                    isGoby: true,
                    request: async ({ method, params }: { method: string, params?: any }) => {
                        if(method === "requestAccounts") {
                            return ["xch1k6mv3caj73akwp0ygpqhjpat20mu3akc3f6xdrc5ahcqkynl7ejq2z74n3"];
                        }
                        return [];
                    },
                    on: async (event: string, callback: any) => {
                        // do nothing
                    }
                }
            );

            await p.connect();
            expect(p.isConnected()).to.be.true;

            await p.close();
            expect(p.isConnected()).to.be.false;

            await p.connect();
            expect(p.isConnected()).to.be.true;
        });

        it("Works if conected and address is changed", async () => {
            let accountsChangedCallback: any;

            const p = new GobyProvider(
                true,
                {
                    isGoby: true,
                    request: async ({ method, params }: { method: string, params?: any }) => {
                        if(method === "requestAccounts") {
                            return ["xch1k6mv3caj73akwp0ygpqhjpat20mu3akc3f6xdrc5ahcqkynl7ejq2z74n3"];
                        }
                        return [];
                    },
                    on: async (event: string, callback: any) => {
                        if(event === "accountsChanged") {
                            accountsChangedCallback = callback;
                        }
                    }
                }
            );

            await p.connect();
            expect(p.isConnected()).to.be.true;

            await accountsChangedCallback("testAddress");
            expect(p.isConnected()).to.be.true;
        });

        it("Works if conected and address is changed to \"\"", async () => {
            let accountsChangedCallback: any;

            const p = new GobyProvider(
                true,
                {
                    isGoby: true,
                    request: async ({ method, params }: { method: string, params?: any }) => {
                        if(method === "requestAccounts") {
                            return ["xch1k6mv3caj73akwp0ygpqhjpat20mu3akc3f6xdrc5ahcqkynl7ejq2z74n3"];
                        }
                        return [];
                    },
                    on: async (event: string, callback: any) => {
                        if(event === "accountsChanged") {
                            accountsChangedCallback = callback;
                        }
                    }
                }
            );

            await p.connect();
            expect(p.isConnected()).to.be.true;

            await accountsChangedCallback("");
            expect(p.isConnected()).to.be.false;
        });
    });

    const _expectNotImplError = async (func: () => Promise<any>) => {
        let thrownOk: boolean = false;

        try {
            await func();
        } catch(err) {
            thrownOk = err instanceof Error && err.message === "GobyProvider does not implement this method.";
        }
        expect(thrownOk).to.be.true;
    }

    it("getBlockNumber()", () => {
        const p = new GobyProvider();
        return _expectNotImplError(() => p.getBlockNumber());
    });

    it("getBalance()", async () => {
        const p = new GobyProvider();
        return _expectNotImplError(() => p.getBalance({}));
    });

    it("subscribeToPuzzleHashUpdates()", async () => {
        const p = new GobyProvider();

        let callbackCalled = false;
        expect(
            () => p.subscribeToPuzzleHashUpdates({
                puzzleHash: "testtest",
                callback: () => callbackCalled = true
            })
        ).to.throw("GobyProvider does not implement this method.");
        expect(callbackCalled).to.to.false;
    });

    it("subscribeToCoinUpdates()", () => {
        const p = new GobyProvider();

        let callbackCalled = false;
        expect(
            () => p.subscribeToCoinUpdates({
                coinId: "testtest",
                callback: () => callbackCalled = true
            })
        ).to.throw("GobyProvider does not implement this method.");
        expect(callbackCalled).to.to.false;
    });

    it("getPuzzleSolution()", async () => {
        const p = new GobyProvider();
        return _expectNotImplError(() => p.getPuzzleSolution({
            coinId: "testtest",
            height: 7
        }));
    });

    it("getCoinChildren()", async () => {
        const p = new GobyProvider();
        return _expectNotImplError(() => p.getCoinChildren({
            coinId: "testtest"
        }));
    });

    it("getBlockHeader()", () => {
        const p = new GobyProvider();
        return _expectNotImplError(() => p.getBlockHeader({
            height: 42
        }));
    });

    it("getBlocksHeaders()", () => {
        const p = new GobyProvider();
        return _expectNotImplError(() => p.getBlocksHeaders({
            startHeight: 7,
            endHeight: 42
        }));
    });

    it("getCoinRemovals()", () => {
        const p = new GobyProvider();
        return _expectNotImplError(() => p.getCoinRemovals({
            height: 7,
            headerHash: "hash"
        }));
    });

    it("getCoinAdditions()", () => {
        const p = new GobyProvider();
        return _expectNotImplError(() => p.getCoinAdditions({
            height: 7,
            headerHash: "hash"
        }));
    });

    describe("transfer()", () => {
        it("Does not request 'transfer' if not connected", async () => {
            let requestedTransfer: boolean = false;

            const p = new GobyProvider(
                true,
                {
                    isGoby: true,
                    request: async ({ method, params }: { method: string, params?: any }) => {
                        if(method === "requestAccounts") {
                            return ["xch1k6mv3caj73akwp0ygpqhjpat20mu3akc3f6xdrc5ahcqkynl7ejq2z74n3"];
                        } else if(method === "transfer") {
                            requestedTransfer = true;
                        }
                        return [];
                    },
                    on: async (event: string, callback: any) => {
                        // do nothing
                    }
                }
            );

            expect(p.isConnected()).to.be.false;

            const result = await p.transfer({
                to: "xch1k6mv3caj73akwp0ygpqhjpat20mu3akc3f6xdrc5ahcqkynl7ejq2z74n3",
                value: 31337
            });

            expect(result).to.be.false;
            expect(requestedTransfer).to.be.false;
        });

        it("Works correctly if user accepts the transfer request", async () => {
            let requestedTransfer: boolean = false;
            let transferArgs: any;

            const p = new GobyProvider(
                true,
                {
                    isGoby: true,
                    request: async ({ method, params }: { method: string, params?: any }) => {
                        if(method === "requestAccounts") {
                            return ["xch1k6mv3caj73akwp0ygpqhjpat20mu3akc3f6xdrc5ahcqkynl7ejq2z74n3"];
                        } else if(method === "transfer") {
                            requestedTransfer = true;
                            transferArgs = params;
                        }
                        return [];
                    },
                    on: async (event: string, callback: any) => {
                        // do nothing
                    }
                }
            );

            await p.connect();

            expect(p.isConnected()).to.be.true;

            const result = await p.transfer({
                to: "xch1k6mv3caj73akwp0ygpqhjpat20mu3akc3f6xdrc5ahcqkynl7ejq2z74n3",
                value: 31337
            });

            expect(result).to.be.true;
            expect(requestedTransfer).to.be.true;

            expect(transferArgs.to).to.equal("xch1k6mv3caj73akwp0ygpqhjpat20mu3akc3f6xdrc5ahcqkynl7ejq2z74n3");
            expect(transferArgs.amount).to.equal("31337");
            expect(transferArgs.memos).to.equal("");
            expect(transferArgs.assetId).to.equal("");
            expect(transferArgs.fee).to.equal("0");
        });

        it("Works correctly if user rejects the transfer request", async () => {
            let requestedTransfer: boolean = false;
            let transferArgs: any;

            const p = new GobyProvider(
                true,
                {
                    isGoby: true,
                    request: async ({ method, params }: { method: string, params?: any }) => {
                        if(method === "requestAccounts") {
                            return ["xch1k6mv3caj73akwp0ygpqhjpat20mu3akc3f6xdrc5ahcqkynl7ejq2z74n3"];
                        } else if(method === "transfer") {
                            requestedTransfer = true;
                            transferArgs = params;
                            throw new Error("User rejected the request.");
                        }
                        return [];
                    },
                    on: async (event: string, callback: any) => {
                        // do nothing
                    }
                }
            );

            await p.connect();

            expect(p.isConnected()).to.be.true;

            const result = await p.transfer({
                to: "xch1k6mv3caj73akwp0ygpqhjpat20mu3akc3f6xdrc5ahcqkynl7ejq2z74n3",
                value: 31337
            });

            expect(result).to.be.false;
            expect(requestedTransfer).to.be.true;

            expect(transferArgs.to).to.equal("xch1k6mv3caj73akwp0ygpqhjpat20mu3akc3f6xdrc5ahcqkynl7ejq2z74n3");
            expect(transferArgs.amount).to.equal("31337");
            expect(transferArgs.memos).to.equal("");
            expect(transferArgs.assetId).to.equal("");
            expect(transferArgs.fee).to.equal("0");
        });
    });

    describe("transferCAT()", () => {
        it("Does not request 'transfer' if not connected", async () => {
            let requestedTransfer: boolean = false;

            const p = new GobyProvider(
                true,
                {
                    isGoby: true,
                    request: async ({ method, params }: { method: string, params?: any }) => {
                        if(method === "requestAccounts") {
                            return ["xch1k6mv3caj73akwp0ygpqhjpat20mu3akc3f6xdrc5ahcqkynl7ejq2z74n3"];
                        } else if(method === "transfer") {
                            requestedTransfer = true;
                        }
                        return [];
                    },
                    on: async (event: string, callback: any) => {
                        // do nothing
                    }
                }
            );

            expect(p.isConnected()).to.be.false;

            const result = await p.transferCAT({
                to: "xch1k6mv3caj73akwp0ygpqhjpat20mu3akc3f6xdrc5ahcqkynl7ejq2z74n3",
                value: 31337,
                assetId: "f7245be4cc6c44e146bfe18c5fb34d70b8e048b1da2916a88e48deb7f6c05efe" // CryptoShibe Platinum
            });

            expect(result).to.be.false;
            expect(requestedTransfer).to.be.false;
        });

        it("Works correctly if user accepts the transfer request", async () => {
            let requestedTransfer: boolean = false;
            let transferArgs: any;

            const p = new GobyProvider(
                true,
                {
                    isGoby: true,
                    request: async ({ method, params }: { method: string, params?: any }) => {
                        if(method === "requestAccounts") {
                            return ["xch1k6mv3caj73akwp0ygpqhjpat20mu3akc3f6xdrc5ahcqkynl7ejq2z74n3"];
                        } else if(method === "transfer") {
                            requestedTransfer = true;
                            transferArgs = params;
                        }
                        return [];
                    },
                    on: async (event: string, callback: any) => {
                        // do nothing
                    }
                }
            );

            await p.connect();

            expect(p.isConnected()).to.be.true;

            const result = await p.transferCAT({
                to: "xch1k6mv3caj73akwp0ygpqhjpat20mu3akc3f6xdrc5ahcqkynl7ejq2z74n3",
                value: 31337,
                assetId: "f7245be4cc6c44e146bfe18c5fb34d70b8e048b1da2916a88e48deb7f6c05efe" // CryptoShibe Platinum
            });

            expect(result).to.be.true;
            expect(requestedTransfer).to.be.true;

            expect(transferArgs.to).to.equal("xch1k6mv3caj73akwp0ygpqhjpat20mu3akc3f6xdrc5ahcqkynl7ejq2z74n3");
            expect(transferArgs.amount).to.equal("31337");
            expect(transferArgs.memos).to.equal("");
            expect(transferArgs.assetId).to.equal("f7245be4cc6c44e146bfe18c5fb34d70b8e048b1da2916a88e48deb7f6c05efe");
            expect(transferArgs.fee).to.equal("0");
        });

        it("Works correctly if user rejects the transfer request", async () => {
            let requestedTransfer: boolean = false;
            let transferArgs: any;

            const p = new GobyProvider(
                true,
                {
                    isGoby: true,
                    request: async ({ method, params }: { method: string, params?: any }) => {
                        if(method === "requestAccounts") {
                            return ["xch1k6mv3caj73akwp0ygpqhjpat20mu3akc3f6xdrc5ahcqkynl7ejq2z74n3"];
                        } else if(method === "transfer") {
                            requestedTransfer = true;
                            transferArgs = params;
                            throw new Error("User rejected the request.");
                        }
                        return [];
                    },
                    on: async (event: string, callback: any) => {
                        // do nothing
                    }
                }
            );

            await p.connect();

            expect(p.isConnected()).to.be.true;

            const result = await p.transferCAT({
                to: "xch1k6mv3caj73akwp0ygpqhjpat20mu3akc3f6xdrc5ahcqkynl7ejq2z74n3",
                value: 31337,
                assetId: "f7245be4cc6c44e146bfe18c5fb34d70b8e048b1da2916a88e48deb7f6c05efe", // CryptoShibe Platinum
            });

            expect(result).to.be.false;
            expect(requestedTransfer).to.be.true;

            expect(transferArgs.to).to.equal("xch1k6mv3caj73akwp0ygpqhjpat20mu3akc3f6xdrc5ahcqkynl7ejq2z74n3");
            expect(transferArgs.amount).to.equal("31337");
            expect(transferArgs.memos).to.equal("");
            expect(transferArgs.assetId).to.equal("f7245be4cc6c44e146bfe18c5fb34d70b8e048b1da2916a88e48deb7f6c05efe");
            expect(transferArgs.fee).to.equal("0");
        });
    });

    describe("acceptOffer()", () => {
        it("Does not request 'takeOffer' if not connected", async () => {
            let requestedTakeOffer: boolean = false;

            const p = new GobyProvider(
                true,
                {
                    isGoby: true,
                    request: async ({ method, params }: { method: string, params?: any }) => {
                        if(method === "requestAccounts") {
                            return ["xch1k6mv3caj73akwp0ygpqhjpat20mu3akc3f6xdrc5ahcqkynl7ejq2z74n3"];
                        } else if(method === "takeOffer") {
                            requestedTakeOffer = true;
                        }
                        return [];
                    },
                    on: async (event: string, callback: any) => {
                        // do nothing
                    }
                }
            );

            expect(p.isConnected()).to.be.false;

            const result = await p.acceptOffer({
                offer: THE_OFFER
            });

            expect(result).to.be.false;
            expect(requestedTakeOffer).to.be.false;
        });

        it("Works correctly if user accepts the transfer request", async () => {
            let requestedTakeOffer: boolean = false;
            let takeOfferArgs: any;

            const p = new GobyProvider(
                true,
                {
                    isGoby: true,
                    request: async ({ method, params }: { method: string, params?: any }) => {
                        if(method === "requestAccounts") {
                            return ["xch1k6mv3caj73akwp0ygpqhjpat20mu3akc3f6xdrc5ahcqkynl7ejq2z74n3"];
                        } else if(method === "takeOffer") {
                            requestedTakeOffer = true;
                            takeOfferArgs = params;
                        }
                        return [];
                    },
                    on: async (event: string, callback: any) => {
                        // do nothing
                    }
                }
            );

            await p.connect();

            expect(p.isConnected()).to.be.true;

            const result = await p.acceptOffer({
                offer: THE_OFFER
            });

            expect(result).to.be.true;
            expect(requestedTakeOffer).to.be.true;

            expect(takeOfferArgs.offer).to.equal(THE_OFFER);
            expect(takeOfferArgs.fee).to.equal("0");
        });

        it("Works correctly if user rejects the transfer request", async () => {
            let requestedTakeOffer: boolean = false;
            let takeOfferArgs: any;

            const p = new GobyProvider(
                true,
                {
                    isGoby: true,
                    request: async ({ method, params }: { method: string, params?: any }) => {
                        if(method === "requestAccounts") {
                            return ["xch1k6mv3caj73akwp0ygpqhjpat20mu3akc3f6xdrc5ahcqkynl7ejq2z74n3"];
                        } else if(method === "takeOffer") {
                            requestedTakeOffer = true;
                            takeOfferArgs = params;
                            throw new Error("User rejected the request.");
                        }
                        return [];
                    },
                    on: async (event: string, callback: any) => {
                        // do nothing
                    }
                }
            );

            await p.connect();

            expect(p.isConnected()).to.be.true;

            const result = await p.acceptOffer({
                offer: THE_OFFER
            });

            expect(result).to.be.false;
            expect(requestedTakeOffer).to.be.true;

            expect(takeOfferArgs.offer).to.equal(THE_OFFER);
            expect(takeOfferArgs.fee).to.equal("0");
        });
    });

    it("subscribeToAddressChanges()", async () => {
        let accountsChangedCallback: any;

        const p = new GobyProvider(
            true,
            {
                isGoby: true,
                request: async ({ method, params }: { method: string, params?: any }) => {
                    if(method === "requestAccounts") {
                        return ["xch1k6mv3caj73akwp0ygpqhjpat20mu3akc3f6xdrc5ahcqkynl7ejq2z74n3"];
                    }
                    return [];
                },
                on: async (event: string, callback: any) => {
                    if(event === "accountsChanged") {
                        accountsChangedCallback = callback;
                    }
                }
            }
        );

        await p.connect();
        expect(p.isConnected()).to.be.true;

        let address: string = "";
        p.subscribeToAddressChanges({
            callback: (addr: string) => address = addr
        });

        expect(address).to.equal("xch1k6mv3caj73akwp0ygpqhjpat20mu3akc3f6xdrc5ahcqkynl7ejq2z74n3");

        await accountsChangedCallback(null);
        expect(address).to.equal("");

        await accountsChangedCallback(["xch1234"]);
        expect(address).to.equal("xch1234");

        await accountsChangedCallback([]);
        expect(address).to.equal("");

        await accountsChangedCallback(["xch1", "xch2", "xch3"]);
        expect(address).to.equal("xch1");

        await p.close();
        expect(address).to.equal("");
    });

    it("signCoinSpends()", () => {
        const p = new GobyProvider();
        return _expectNotImplError(() => p.signCoinSpends({
            coinSpends: []
        }));
    });
});