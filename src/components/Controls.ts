export type ControlType = "KEYS" | "DUMMY";

class Controls {
  forward: boolean;
  reverse: boolean;
  left: boolean;
  right: boolean;

  constructor(type: ControlType = "KEYS") {
    this.forward = false;
    this.reverse = false;
    this.left = false;
    this.right = false;

    switch (type) {
      case "KEYS":
        this.addKeyboardListeners();
        break;
      case "DUMMY":
        this.forward = true;
        break;
      default:
        break;
    }
  }

  private addKeyboardListeners() {
    window.addEventListener("keydown", (e) => {
      switch (e.key) {
        case "ArrowLeft":
          this.left = true;
          break;
        case "ArrowRight":
          this.right = true;
          break;
        case "ArrowUp":
          this.forward = true;
          break;
        case "ArrowDown":
          this.reverse = true;
          break;
        default:
          break;
      }
    });

    window.addEventListener("keyup", (e) => {
      switch (e.key) {
        case "ArrowLeft":
          this.left = false;
          break;
        case "ArrowRight":
          this.right = false;
          break;
        case "ArrowUp":
          this.forward = false;
          break;
        case "ArrowDown":
          this.reverse = false;
          break;
        default:
          break;
      }
    });
  }
}

export { Controls };
