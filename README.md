# node-red-contrib-azure-iot

Node-RED nodes for interacting with **Azure IoT**:
- Receive **device-to-cloud** events from IoT Hub using the **Event Hub compatible endpoint**
- Receive **cloud-to-device** messages as a device
- Send **device-to-cloud** telemetry as a device

## Features

- **Multiple transport protocols (device nodes):** supports `http`, `amqp`, `mqtt`, `amqpWs`.
- **Flexible configuration for sending (Device Transmitter):**
  - configure connection details in the node, **or**
  - provide them dynamically per message (useful for multi-device flows or switching hubs at runtime).
- **Rich receive metadata (not just payload):**
  - Device Receiver also exposes received **message properties**
  - IoT Hub Receiver also exposes **custom properties, system properties, correlation id and message id**
- **Clear runtime feedback via node status** (e.g. connected/received/error/disconnected depending on node)

## Azure Requirements

- **Device nodes (Receiver/Transmitter):**
  - Works with **Azure IoT Hub** device identities and also with **Azure IoT Central** devices (using the device connection details provided by IoT Central / underlying IoT Hub).

- **IoT Hub Receiver node (Event Hub compatible endpoint):**
  - Requires an **Azure IoT Hub** with access to its **Event Hub compatible endpoint** (connection string + consumer group; optional Event Hub name).

## Nodes

### 1) Azure IoT Device - Receiver (`azure-iot-device-receiver`)

Receives **cloud-to-device** messages for a single device.

**Configuration**
- Protocol: `http | amqp | mqtt | amqpWs`
- Hostname (e.g. `*.azure-devices.net`)
- Device Id
- SAS Key (stored as credential)

**Output**
```js
msg.payload      // message.getData()
msg.properties   // message.properties.propertyList
```

---

### 2) Azure IoT Device - Transmitter (`azure-iot-device-transmitter`)

Sends **device-to-cloud** messages.

**Static or dynamic configuration**
You can configure connection values in the node **or** provide them on each incoming message.

**Input**
- `msg.payload` (`string | Buffer | object`)  
  If an object is provided it is sent as JSON (depending on your implementation).

**Dynamic config (only if not set in the node UI)**
- `msg.protocol` one of `http | amqp | mqtt | amqpWs`
- `msg.hostname`
- `msg.deviceId`
- `msg.sasKey`

**Output**
```js
msg.payload === "Message sent."
```

---

### 3) Azure IoT Hub - Receiver (`azure-iot-hub-receiver`)

Receives **device-to-cloud events/telemetry** from IoT Hub via the Event Hub compatible endpoint.

**Configuration**
- Connection String (stored as credential)
- Consumer Group (often `$Default`)
- Event Hub Name (optional)

**Output**
```js
msg.payload            // event.body
msg.custom_properties  // event.properties
msg.system_properties  // event.systemProperties
msg.correlation_id     // event.correlationId
msg.message_id         // event.messageId
```

## License & Notice

See [LICENSE](LICENSE) and [NOTICE](NOTICE).
