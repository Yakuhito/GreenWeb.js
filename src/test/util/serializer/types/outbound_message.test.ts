import { expect } from "chai";
import { makeMsg, NodeType } from "../../../../util/serializer/types/outbound_message";
import { ProtocolMessageTypes } from "../../../../util/serializer/types/protocol_message_types";
import { Capability, Handshake } from "../../../../util/serializer/types/shared_protocol";

describe("makeMsg()", () => {
    it("Can correctly serialize handshake message", () => {
        // eslint-disable-next-line max-len
        const expectedOutput = "010000000037000000076d61696e6e65740000000776302e302e33330000000f477265656e5765622076312e302e3420fc060000000100010000000131";

        const handshake: Handshake = new Handshake();
        handshake.networkId = "mainnet";
        handshake.protocolVersion = "v0.0.33";
        handshake.softwareVersion = "GreenWeb v1.0.4";
        handshake.serverPort = 8444;
        handshake.nodeType = NodeType.WALLET;
        handshake.capabilities = [[Capability.BASE, "1"],];
        
        const handshakeMsg: Buffer = makeMsg(
            ProtocolMessageTypes.handshake,
            handshake
        );

        expect(handshakeMsg.toString("hex")).to.equal(expectedOutput);
    });
});