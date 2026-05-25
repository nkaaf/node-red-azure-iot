import { NodeInitializer } from "node-red";
import { AzureIoTDeviceNodeDef, AzureIoTDeviceReceiverNode, AzureIoTDeviceTransmitterNode, AzureIoTHubReceiverNode, AzureIoTHubReceiverNodeDef } from "./common/types";
import { AzureIoTHubReceiver } from "./nodes/azure-iot-hub-receiver";
import { AzureIoTDeviceTransmitter } from "./nodes/azure-iot-device-transmitter";
import { AzureIoTDeviceReceiver } from "./nodes/azure-iot-device-receiver";

const nodeInit: NodeInitializer = (RED) => {
    function createAzureIoTDeviceTransmitterNode(this: AzureIoTDeviceTransmitterNode, config: AzureIoTDeviceNodeDef) {
        RED.nodes.createNode(this, config);
        new AzureIoTDeviceTransmitter(this, config);
    }

    function createAzureIoTDeviceReceiverNode(this: AzureIoTDeviceReceiverNode, config: AzureIoTDeviceNodeDef) {
        RED.nodes.createNode(this, config);
        new AzureIoTDeviceReceiver(this, config);
    }

    function createAzureIoTHubReceiverNode(this: AzureIoTHubReceiverNode, config: AzureIoTHubReceiverNodeDef) {
        RED.nodes.createNode(this, config);
        new AzureIoTHubReceiver(this, config);
    }

    RED.nodes.registerType("azure-iot-device-transmitter", createAzureIoTDeviceTransmitterNode, {
        credentials: {
            sasKey: { type: "password" },
        }
    });

    RED.nodes.registerType("azure-iot-device-receiver", createAzureIoTDeviceReceiverNode, {
        credentials: {
            sasKey: { type: "password" },
        }
    });

    RED.nodes.registerType("azure-iot-hub-receiver", createAzureIoTHubReceiverNode, {
        credentials: {
            connectionString: { type: "password" },
        }
    });
}

module.exports = nodeInit;
