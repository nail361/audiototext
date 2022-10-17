import SimpleAudio from "./simpleAudio";

export default interface ComplexAudio extends SimpleAudio {
  cost: number;
  ready: boolean;
}
