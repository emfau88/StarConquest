const DEFAULT_STEP_SECONDS = 1 / 60;
const DEFAULT_MAX_FRAME_SECONDS = 0.25;
const DEFAULT_MAX_STEPS_PER_FRAME = 15;

export class FixedStepClock {
  private accumulatorSeconds = 0;

  constructor(
    private readonly stepSeconds = DEFAULT_STEP_SECONDS,
    private readonly maxFrameSeconds = DEFAULT_MAX_FRAME_SECONDS,
    private readonly maxStepsPerFrame = DEFAULT_MAX_STEPS_PER_FRAME,
  ) {}

  advance(
    frameSeconds: number,
    update: (stepSeconds: number) => void,
  ): number {
    const safeFrameSeconds =
      Number.isFinite(frameSeconds) && frameSeconds > 0
        ? Math.min(frameSeconds, this.maxFrameSeconds)
        : 0;
    this.accumulatorSeconds = Math.min(
      this.maxFrameSeconds,
      this.accumulatorSeconds + safeFrameSeconds,
    );

    let steps = 0;
    while (
      this.accumulatorSeconds + Number.EPSILON >= this.stepSeconds &&
      steps < this.maxStepsPerFrame
    ) {
      update(this.stepSeconds);
      this.accumulatorSeconds = Math.max(
        0,
        this.accumulatorSeconds - this.stepSeconds,
      );
      steps += 1;
    }

    if (
      steps === this.maxStepsPerFrame &&
      this.accumulatorSeconds >= this.stepSeconds
    ) {
      this.accumulatorSeconds %= this.stepSeconds;
    }
    return steps;
  }

  reset(): void {
    this.accumulatorSeconds = 0;
  }
}
