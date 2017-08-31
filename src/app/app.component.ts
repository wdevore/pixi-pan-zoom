import {
  Component, ViewChild, ElementRef, OnInit, NgZone,
} from '@angular/core';

import * as PIXI from 'pixi.js';
import {Input} from './input/input';
import {Zoom} from './core/zoom';

/*
  To launch server open Terminal from
  /Users/xxx/Documents/Development/GameDev/Web/moon-ranger
  and type:
  >ng serve
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  @ViewChild('pixiDiv') pixiDiv: ElementRef;

  private pixiApp: PIXI.Application;
  private renderer: PIXI.SystemRenderer;
  private stage: PIXI.Container;
  private input: Input;

  private overlay: PIXI.Graphics;
  private game: PIXI.Container;
  private zoomContainer: PIXI.Container;
  private orangeRect: PIXI.Graphics;
  private blueRect: PIXI.Graphics;
  private cursorRect: PIXI.Graphics;

  private mouseViewPos: PIXI.Text;
  private mouseGamePos: PIXI.Text;
  private globalViewPos: PIXI.Text;
  private localViewPos: PIXI.Text;
  private graphicPos: PIXI.Text;

  private globalOriginPt: PIXI.Point = new PIXI.Point();
  private mousePt: PIXI.Point = new PIXI.Point();

  private zoom: Zoom = new Zoom();

  // We inject the zone so we can run the animation callback outside
  // of the Angular's zone.
  constructor(public ngZone: NgZone) {
  }

  ngOnInit() {
    this.setupPixi();

    this.setupStage();

    this.input = new Input(this.pixiDiv);

    // Only need to run outside once. The rest will happen automatically there after.
    // https://teropa.info/blog/2016/12/12/graphics-in-angular-2.html
    // Note: The call is done via a trivial lambda in order to capture the context of the class.
    // If we don't "this" is undefined inside the start method.
    this.ngZone.runOutsideAngular(() => this.start());
  }

  private setupPixi() {
    this.pixiApp = new PIXI.Application(1000, 600,
      {
        antialias: true,
        transparent: false,
        backgroundColor: 0x777777
      }
    );
    this.pixiDiv.nativeElement.appendChild(this.pixiApp.view);
    // Note: make DIV has tabIndex > 0 as well.
    this.pixiDiv.nativeElement.focus();

    this.renderer = this.pixiApp.renderer;

    this.stage = this.pixiApp.stage;
    this.stage.interactive = true;
  }

  private setupStage() {
    this.overlay = new PIXI.Graphics();
    this.game = new PIXI.Container();

    this.zoomContainer = new PIXI.Container();
    this.zoomContainer.addChild(this.game);

    this._updateZoom();

    // Override node's transform. NOTE I wouldn't use this approach as you don't
    // get full access to pixi's innards this way.
    // this.game.updateTransform = () => {
    //   const t = this.zoom.Transform;
    //
    //   // this.game._boundsID++;
    //   this.game.transform.localTransform.set(t.a, t.b, t.c, t.d, t.tx, t.ty);
    //   this.zoomContainer.transform.updateTransform(this.game.transform);
    //
    //   // TODO: check render flags, how to process stuff here
    //   this.game.worldAlpha = this.game.alpha * this.game.parent.worldAlpha;
    //
    //   for (let i = 0, j = this.game.children.length; i < j; ++i) {
    //     const child = this.game.children[i];
    //     if (child.visible) {
    //       child.updateTransform();
    //     }
    //   }
    // };

    this.blueRect = new PIXI.Graphics();
    this.blueRect.lineStyle(2, 0x0000FF, 1);
    this.blueRect.drawRect(0, 0, 100, 100);

    // set a fill and line style
    this.orangeRect = new PIXI.Graphics();
    this.orangeRect.lineStyle(10, 0xffd900, 1);
    // draw a shape
    this.orangeRect.beginFill(0xFF3300);
    this.orangeRect.drawRect(50, 50, 200, 200);
    this.orangeRect.endFill();

    this.game.addChild(this.orangeRect);
    this.game.addChild(this.blueRect);

    this.mouseViewPos = new PIXI.Text('x,y', {fontFamily: 'Verdana', fontSize: '18px', fill: 'white'});
    this.mouseViewPos.x = 10.0;
    this.overlay.addChild(this.mouseViewPos);

    this.mouseGamePos = new PIXI.Text('x,y', {fontFamily: 'Verdana', fontSize: '18px', fill: 'white'});
    this.mouseGamePos.x = 10.0;
    this.mouseGamePos.y = 20.0;
    this.overlay.addChild(this.mouseGamePos);

    this.globalViewPos = new PIXI.Text('x,y', {fontFamily: 'Verdana', fontSize: '18px', fill: 'white'});
    this.globalViewPos.x = 10.0;
    this.globalViewPos.y = 40.0;
    this.overlay.addChild(this.globalViewPos);

    this.localViewPos = new PIXI.Text('x,y', {fontFamily: 'Verdana', fontSize: '18px', fill: 'white'});
    this.localViewPos.x = 10.0;
    this.localViewPos.y = 60.0;
    this.overlay.addChild(this.localViewPos);

    this.graphicPos = new PIXI.Text('x,y', {fontFamily: 'Verdana', fontSize: '18px', fill: 'white'});
    this.graphicPos.x = 10.0;
    this.graphicPos.y = 80.0;
    this.overlay.addChild(this.graphicPos);

    this.cursorRect = new PIXI.Graphics();
    this.cursorRect.lineStyle(1, 0xFFFFFF, 1);
    this.cursorRect.drawRect(-5, -5, 10, 10);
    // this.overlay.addChild(this.cursorRect);
    this.game.addChild(this.cursorRect);


    this.pixiApp.stage.addChild(this.zoomContainer);
    this.pixiApp.stage.addChild(this.overlay);
  }

  // Runs outside on Angular's zone. This minimizes excessive change events.
  private start() {
    this.pixiApp.ticker.add((delta) => {
      const input = this.input;

      // delta is 1 if running at 100% performance
      // creates frame-independent transformation
      // some.property += rate * delta;
      if (input.isZKeyActive) {
        // console.log('ZZZzzz...');
      }
      if (input.isLeftKeyActive) {
        // console.log('left');
        this.blueRect.x -= 1.0 * delta;
      }
      if (input.isRightKeyActive) {
        // console.log('right');
        this.blueRect.x += 1.0 * delta;
      }
      if (input.isUpKeyActive) {
        this.blueRect.y -= 1.0 * delta;
      }
      if (input.isDownKeyActive) {
        this.blueRect.y += 1.0 * delta;
      }

      // Map mouse position to game-space position via the overlay-space.
      this.mousePt.set(input.mouseX, input.mouseY);

      // overlay is the same as view-space so it is the relative object.
      const gamePt: PIXI.Point = this.game.toLocal(this.mousePt, this.overlay);
      this.mouseGamePos.text = `Game: ${gamePt.x}, ${gamePt.y}`;

      if (input.isDragging) {
        this.zoom.translateBy(this.input.mouseDX, this.input.mouseDY);
        this.input.clearMouseDelta();
        this._updateZoom();
      } else {
        this.zoom.setScaleCenter(gamePt.x, gamePt.y);
        this.cursorRect.position.set(gamePt.x, gamePt.y);
      }

      if (input.isZoomIn) {
        this._zoomIn(gamePt);
      } else if (input.isZoomOut) {
        this._zoomOut(gamePt);
      }

      this.mouseViewPos.text = `View: ${input.mouseX}, ${input.mouseY}`;

      // Map blue rect into global-space
      const globalPt: PIXI.Point = this.game.toGlobal(this.blueRect.position);
      // Map the zero vector in global-space into bluerect-space via game-space.
      const localPt: PIXI.Point = this.game.toLocal(this.globalOriginPt, this.blueRect);

      this.globalViewPos.text = `Global: ${globalPt.x}, ${globalPt.y}`;
      this.localViewPos.text = `Local: ${localPt.x}, ${localPt.y}`;
      this.graphicPos.text = `Graphic: ${this.blueRect.x}, ${this.blueRect.y}`;
    });
  }

  private _zoomIn(at: PIXI.Point) {
    this.zoom.zoomBy(0.1, 0.1);
    this._updateZoom();
  }

  private _zoomOut(at: PIXI.Point) {
    this.zoom.zoomBy(-0.1, -0.1);
    this._updateZoom();
  }

  private _updateZoom() {
    const t = this.zoom.Transform;

    this.game.transform.localTransform.set(t.a, t.b, t.c, t.d, t.tx, t.ty);
    this.zoomContainer.transform.updateTransform(this.game.transform);
  }
}

// ------------------------------------------------------------------------------
// Test code:
// ------------------------------------------------------------------------------
// import {
//   Component, ViewChild, ElementRef, OnInit, NgZone,
//   HostListener
// } from '@angular/core';

// declare var PIXI: any;
// declare const KeyActionBinder: any;


// private ctx: CanvasRenderingContext2D;
// @ViewChild('rootCanvas') canvasRef: ElementRef;

// console.log('PIXI', PIXI);
// Create the renderer
// this.renderer = PIXI.autoDetectRenderer(256, 256);

// Add the canvas to the HTML document
// this.pixiRef.nativeElement.appendChild(this.renderer.view);

// Create a container object called the `stage`
// this.stage = new PIXI.Container();
// this.stage.addChild(this.g);

// this.ngZone.runOutsideAngular(() => this.step());

// Tell the `renderer` to `render` the `stage`
// this.renderer.render(this.stage);

// this.binder = new KeyActionBinder();
//
// this.binder.action('move-left')
//   .bind(KeyActionBinder.KeyCodes.LEFT)
//   .bind(KeyActionBinder.GamepadButtons.DPAD_LEFT);
//
// this.binder.action('move-right')
//   .bind(KeyActionBinder.KeyCodes.RIGHT)
//   .bind(KeyActionBinder.GamepadButtons.DPAD_RIGHT);

// this.ctx = this.canvasRef.nativeElement.getContext('2d');
// this.ctx.beginPath();
// this.ctx.moveTo(0,0);
// this.ctx.lineTo(100,100);
// this.ctx.stroke();

// The manual approach to animating. Use the ticker instead.
// step() {
//   // console.log("step", this.input);
//   if (this.input.isMouseDown) {
//     console.log('down');
//   }
//
//   this.renderer.render(this.stage);
//
//   requestAnimationFrame(() => this.step());
// }

// if (this.binder.action('move-left').activated) {
//   console.log('left');
// } else if (this.binder.action('move-right').activated) {
//   console.log('right');
// }

// @HostListener('mouseup')
// onMouseup() {
//   console.log('mouse up');
//   this._mouseDown = false;
// }
//
// @HostListener('mousedown')
// onMousedown() {
//   console.log('mouse down');
//   this._mouseDown = true;
// }

// private _mouseDownHandler(event) {
//   this._mouseDown = true;
//   console.log('pointer down');
// }
//
// private _mouseUpHandler(event) {
//   this._mouseDown = false;
//   console.log('pointer up');
// }
//
// public get isMouseDown(): boolean {
//   // console.log("isMouseDown", this);
//   return this.input.isMouseDown;
//   // return this._mouseDown;
// }

