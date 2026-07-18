export default class Snowflake {
  constructor(workerId) {
    const twepoch = 1704067200000n; // 2024-01-01

    this.epoch = twepoch;

    // Worker ID: 0 - 1023
    this.workerId = BigInt(workerId);

    this.workerIdBits = 10n;
    this.sequenceBits = 12n;

    this.maxWorkerId = (1n << this.workerIdBits) - 1n;
    this.sequenceMask = (1n << this.sequenceBits) - 1n;

    this.workerIdShift = this.sequenceBits;
    this.timestampShift = this.sequenceBits + this.workerIdBits;

    this.sequence = 0n;
    this.lastTimestamp = -1n;

    if (this.workerId < 0 || this.workerId > this.maxWorkerId) {
      throw new Error("Worker ID must be between 0 and 1023");
    }
  }

  generate() {
    let timestamp = this.currentTime();

    if (timestamp < this.lastTimestamp) {
      throw new Error("Clock moved backwards. Refusing to generate ID.");
    }

    if (timestamp === this.lastTimestamp) {
      this.sequence = (this.sequence + 1n) & this.sequenceMask;

      if (this.sequence === 0n) {
        timestamp = this.waitNextMillis(timestamp);
      }
    } else {
      this.sequence = 0n;
    }

    this.lastTimestamp = timestamp;

    return (
      ((timestamp - this.epoch) << this.timestampShift) |
      (this.workerId << this.workerIdShift) |
      this.sequence
    );
  }

  currentTime() {
    return BigInt(Date.now());
  }

  waitNextMillis(timestamp) {
    while (timestamp <= this.lastTimestamp) {
      timestamp = this.currentTime();
    }

    return timestamp;
  }
}
