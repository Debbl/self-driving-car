import { lerp } from "~/utils";

class NeuralNetwork {
  levels: Level[] = [];

  constructor(neuronCounts: number[]) {
    for (let i = 0; i < neuronCounts.length - 1; i++) {
      this.levels.push(new Level(neuronCounts[i], neuronCounts[i + 1]));
    }
  }

  static feedForward(givenInputs: number[], network: NeuralNetwork) {
    let outputs = Level.feedForward(givenInputs, network.levels[0]);

    for (let i = 1; i < network.levels.length; i++) {
      outputs = Level.feedForward(outputs, network.levels[i]);
    }

    return outputs;
  }

  static mutate(network: NeuralNetwork, amount = 1) {
    network.levels.forEach((level) => {
      level.biases = level.biases.map((bias) =>
        lerp(bias, Math.random() * 2 - 1, amount),
      );

      level.weights = level.weights.map((weight) =>
        weight.map((w) => lerp(w, Math.random() * 2 - 1, amount)),
      );
    });
  }
}

class Level {
  inputs: number[];
  outputs: number[];
  biases: number[];
  weights: number[][];

  constructor(inputCount: number, outputCount: number) {
    this.inputs = Array.from({ length: inputCount });
    this.outputs = Array.from({ length: outputCount });
    this.biases = Array.from({ length: outputCount });
    this.weights = this.inputs.map(() => Array.from({ length: outputCount }));

    Level.randomize(this);
  }

  static randomize(level: Level) {
    level.inputs.forEach((_, i) => {
      level.outputs.forEach((_, j) => {
        level.weights[i][j] = Math.random() * 2 - 1;
      });
    });

    level.biases = level.biases.map(() => Math.random() * 2 - 1);
  }

  static feedForward(givenInputs: number[], level: Level) {
    level.inputs = level.inputs.map((_, index) => givenInputs[index]);

    level.outputs = level.outputs.map((_, index) => {
      const sum = level.inputs.reduce(
        (acc, input, i) => acc + input * level.weights[i][index],
        0,
      );

      return sum > level.biases[index] ? 1 : 0;
    });

    return level.outputs;
  }
}

export { NeuralNetwork, Level };
