# pixi-pan-zoom
This is an example of how to add pan and zoom to your [Pixi](https://pixijs.com) project.

**WARNING** the demo was thrown together in AngularCLI. Don't worry though the entire code is in three files: *input.ts, zoom.ts and app.component.ts*. All the rest of the files are bulk created by the angular-cli tool, but most importantly pay attention to *zoom.ts* as that is where the gist of the algorithm is, the rest is just support code for mouse, keyboard and stuff.

On a side note it does show how to make pixi work in Angular while avoiding Angular's event zones. The white text is the mouse's positional data mapped into various spaces. You can move the blue rectangle using the arrow keys. As a bonus the zoom and pan can be animated using Tweens if need be, I know because I was doing it in my engine, watch the triangle ship move in and out of zoom zones and you will get the idea:

[Ranger video](https://plus.google.com/u/0/b/109136453872758385259/photos/photo/109136453872758385259/6068339953594223986?icm=false&iso=true)

There is technically three ways you can manipulate pixi's container: inheritance, override the updateTransform() or overwrite a localTransform. I originally did the second option but didn't like the fact that I couldn't access any private or protected data. I ended up, for simplicity of the demo, going with option #3 and that is what you will see in the ticker callback which ultimately calls _updateZoom():

      private _updateZoom() {
        const t = this.zoom.Transform;

        this.game.transform.localTransform.set(t.a, t.b, t.c, t.d, t.tx, t.ty);
        this.zoomContainer.transform.updateTransform(this.game.transform);
      }

One thing to notice is that I create an outer Container node so I can control the update. "this.zoomContainer" contains "this.game", this is important because it gives me a "parent" that I can control when to perform a transform update. This is the one main concept that makes the code work, using .parent doesn't work because you end up trying to update "yourself".

The scenegraph looks like this:

    stage
      zoomContainer
       game
        blueRect
        orangeRect
        cursorRect
      overlay
       text
   
Funny, there is more code man-handling the mouse than there is zoom code, lol. In the long run I would probably use option #2 and extend the Container class to create a new node called, say, ZoomContainer.


This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.3.1.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).
Before running the tests make sure you are serving the app via `ng serve`.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
