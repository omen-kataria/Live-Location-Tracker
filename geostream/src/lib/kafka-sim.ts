import { EventEmitter } from 'events';

/**
 * A simulation of Kafka's event stream architecture.
 * Supports Topics, Producers, and Consumers with Group IDs.
 */
class KafkaSim extends EventEmitter {
  private topics: Map<string, any[]> = new Map();
  private consumerGroups: Map<string, Map<string, number>> = new Map(); // groupId -> topic -> offset

  constructor() {
    super();
  }

  async produce(topic: string, message: any) {
    if (!this.topics.has(topic)) {
      this.topics.set(topic, []);
    }
    const messages = this.topics.get(topic)!;
    messages.push(message);
    
    // Emit to all matching topic subscribers
    this.emit(`topic:${topic}`, {
      topic,
      value: message,
      offset: messages.length - 1,
      timestamp: Date.now()
    });
  }

  async consume(groupId: string, topic: string, callback: (message: any) => void) {
    if (!this.consumerGroups.has(groupId)) {
      this.consumerGroups.set(groupId, new Map());
    }
    const groupOffsets = this.consumerGroups.get(groupId)!;
    
    // Start from the current offset
    let currentOffset = groupOffsets.get(topic) || 0;
    const messages = this.topics.get(topic) || [];
    
    // Process backlog
    while (currentOffset < messages.length) {
      callback(messages[currentOffset]);
      currentOffset++;
    }
    groupOffsets.set(topic, currentOffset);

    // Listen for new messages
    this.on(`topic:${topic}`, (event) => {
      callback(event.value);
      groupOffsets.set(topic, event.offset + 1);
    });
  }
}

export const kafka = new KafkaSim();

export class Producer {
  async send(topic: string, message: any) {
    console.log(`[Kafka Producer] Publishing to ${topic}:`, message);
    await kafka.produce(topic, message);
  }
}

export class Consumer {
  constructor(private groupId: string) {}

  async subscribe(topic: string, callback: (message: any) => void) {
    console.log(`[Kafka Consumer] Group ${this.groupId} subscribed to ${topic}`);
    await kafka.consume(this.groupId, topic, callback);
  }
}
