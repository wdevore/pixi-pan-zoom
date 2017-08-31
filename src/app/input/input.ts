import {
  ElementRef
} from '@angular/core';

export class Input {

  private _mouseDown = false;
  // Drag = down && moved
  private _mouseMoved = false;

  // Custom keys specific to game
  private _zKeyActive = false;
  private _leftKeyActive = false;
  private _rightKeyActive = false;
  private _upKeyActive = false;
  private _downKeyActive = false;

  private _cntlKeyActive = false;
  private _altKeyActive = false;
  private _cmdKeyActive = false;

  private _mouseDownX = 0;
  private _mouseDownY = 0;
  private _prevDownX = 0;
  private _prevDownY = 0;
  private _mouseX = 0;
  private _mouseY = 0;
  private _mouseDX = 0;
  private _mouseDY = 0;

  private _wheeldx = 0;
  private _wheeldyUp = 0;
  private _wheeldyDown = 0;
  private _wheeldz = 0; // pinching two fingers on mousepad.

  private _element;

  constructor(private pixiDiv: ElementRef) {
    this._element = pixiDiv.nativeElement;

    this._element.addEventListener('keydown', (event) => this._keydownHandler(event), false);
    this._element.addEventListener('keyup', (event) => this._keyupHandler(event), false);

    this._element.addEventListener('mousedown', (event) => this._mouseDownHandler(event), false);
    this._element.addEventListener('mouseup', (event) => this._mouseUpHandler(event), false);
    this._element.addEventListener('mousemove', (event) => this._mouseMoveHandler(event), false);

    this._element.addEventListener('wheel', (event) => this._mouseWheelHandler(event), {capture: false});
  }

  private _keydownHandler(event: KeyboardEvent) {
    // console.log('_keydownHandler', event.keyCode);
    switch (event.keyCode) {
      case 90: // Z
        this._zKeyActive = true;
        break;
      case 37: // left arrow
        this._leftKeyActive = true;
        break;
      case 38: // up arrow
        this._upKeyActive = true;
        break;
      case 39: // right arrow
        this._rightKeyActive = true;
        break;
      case 40: // down arrow
        this._downKeyActive = true;
        break;
      case 17: // control key
        this._cntlKeyActive = true;
        break;
      case 18: // alt key
        this._altKeyActive = true;
        break;
      case 91: // command key
        this._cmdKeyActive = true;
        break;
    }
  }

  private _keyupHandler(event: KeyboardEvent) {
    // console.log('_keyupHandler', event.keyCode);
    switch (event.keyCode) {
      case 90: // Z
        this._zKeyActive = false;
        break;
      case 37: // left arrow
        this._leftKeyActive = false;
        break;
      case 38: // up arrow
        this._upKeyActive = false;
        break;
      case 39: // right arrow
        this._rightKeyActive = false;
        break;
      case 40: // down arrow
        this._downKeyActive = false;
        break;
      case 17: // control key
        this._cntlKeyActive = false;
        break;
      case 18: // alt key
        this._altKeyActive = false;
        break;
      case 91: // command key
        this._cmdKeyActive = false;
        break;
    }
  }

  private _mouseDownHandler(event: MouseEvent) {
    this._mouseDown = true;

    this._mouseDownX = event.pageX - this._element.offsetLeft;
    this._mouseDownY = event.pageY - this._element.offsetTop;
    this._prevDownX = this._mouseDownX;
    this._prevDownY = this._mouseDownY;

    // console.log('pointer down', this._mouseDown);
    event.preventDefault();
  }

  private _mouseWheelHandler(event: WheelEvent) {
    this._wheeldx = event.deltaX;
    if (event.deltaY < 0) {
      this._wheeldyUp = event.deltaY;
    } else if (event.deltaY > 0) {
      this._wheeldyDown = event.deltaY;
    }
    this._wheeldz = event.deltaZ;
    // console.log('wheel', event);

    event.preventDefault();
  }

  private _mouseUpHandler(event) {
    this._mouseDown = false;
    this._mouseMoved = false;
    event.preventDefault();
  }

  private _mouseMoveHandler(event) {
    this._mouseX = event.pageX - this._element.offsetLeft;
    this._mouseY = event.pageY - this._element.offsetTop;

    if (this._mouseDown) {
      this._mouseMoved = true;
      // if (this._cmdKeyActive) {
        // Dragging.
        this._mouseDX = this._mouseX - this._prevDownX;
        this._mouseDY = this._mouseY - this._prevDownY;
      // }
    }

    this._prevDownX = this._mouseX;
    this._prevDownY = this._mouseY;

    event.preventDefault();
  }

  public get isMouseDown(): boolean {
    return this._mouseDown;
  }

  public get isControlKeyDown(): boolean {
    return this._cntlKeyActive;
  }

  public get isCommandKeyDown(): boolean {
    return this._cmdKeyActive;
  }

  public get isAltKeyDown(): boolean {
    return this._altKeyActive;
  }

  public get mouseMoved(): boolean {
    return this._mouseDown && this._mouseMoved;
  }

  public clearMouseDelta() {
    this._mouseDX = 0;
    this._mouseDY = 0;
  }

  public get mouseDX(): number {
    return this._mouseDX;
  }

  public get mouseDY(): number {
    return this._mouseDY;
  }

  public get mouseX(): number {
    return this._mouseX;
  }

  public get mouseY(): number {
    return this._mouseY;
  }

  public get isZKeyActive(): boolean {
    return this._zKeyActive;
  }

  public get isLeftKeyActive(): boolean {
    return this._leftKeyActive;
  }

  public get isRightKeyActive(): boolean {
    return this._rightKeyActive;
  }

  public get isUpKeyActive(): boolean {
    return this._upKeyActive;
  }

  public get isDownKeyActive(): boolean {
    return this._downKeyActive;
  }

  public get isDragging(): boolean {
    return this._mouseDown;
  }

  public get isZoomIn(): boolean {
    // if (this._altKeyActive) {
    const b = this._wheeldyUp < 0;
    this._wheeldyUp = 0;
    return b;
    // }
    // return false;
  }

  public get isZoomOut(): boolean {
    // if (this._altKeyActive) {
    const b = this._wheeldyDown > 0;
    this._wheeldyDown = 0;
    return b;
    // }
    // return false;
  }
}
