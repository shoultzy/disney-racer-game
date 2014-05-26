require([
	'goo/entities/GooRunner',
	'goo/fsmpack/statemachine/StateMachineSystem',
	'goo/entities/systems/HtmlSystem',
	'goo/timelinepack/TimelineSystem',
	'goo/loaders/DynamicLoader',
	'goo/util/combine/EntityCombiner',
	'goo/renderer/Renderer',
	'goo/util/rsvp',

	'js/CanvasWrapper',
	'js/checkBrowser',

	'goo/fsmpack/StateMachineComponentHandler',
	'goo/fsmpack/MachineHandler',
	'goo/timelinepack/TimelineComponentHandler',
	'goo/quadpack/QuadComponentHandler'
], function (
	GooRunner,
	StateMachineSystem,
	HtmlSystem,
	TimelineSystem,
	DynamicLoader,
	EntityCombiner,
	Renderer,
	RSVP,

	CanvasWrapper,
	checkBrowser
) {
	'use strict';

	function setup(gooRunner, loader) {
			// Application code goes here!

			/*
			To get a hold of entities, one can use the World's selection functions:
			var allEntities = gooRunner.world.getEntities();                  // all
			var entity      = gooRunner.world.by.name('EntityName').first();  // by name
			*/
	}

	function init() {
		// Prevent browser peculiarities to mess with our controls.
		document.body.addEventListener('touchstart', function (event) {
			event.preventDefault();
		}, false);

		// Check that the browser supports webGL
		checkBrowser();

		// Init the GooEngine
		var gooRunner = initGoo();
		var world = gooRunner.world;

		var transformSystem = world.getSystem('TransformSystem');
		var cameraSystem = world.getSystem('CameraSystem');
		var boundingSystem = world.getSystem('BoundingUpdateSystem');
		var renderSystem = world.getSystem('RenderSystem');

		// Load the project
		loadProject(gooRunner).then(function (loader) {
			world.processEntityChanges();
			transformSystem._process();
			cameraSystem._process();
			boundingSystem._process();
			if (Renderer.mainCamera) { gooRunner.renderer.checkResize(Renderer.mainCamera); }
			return setup(gooRunner, loader);
		}).then(function () {
			new EntityCombiner(world).combine();
			world.processEntityChanges();
			transformSystem._process();
			cameraSystem._process();
			boundingSystem._process();
			renderSystem._process();

			var promise = new RSVP.Promise();

			gooRunner.renderer.precompileShaders(renderSystem._activeEntities, renderSystem.lights, function () {
				gooRunner.renderer.preloadMaterials(renderSystem._activeEntities, function () {
					promise.resolve();
				});
			});
			return promise;
		}).then(function () {
			// Hide the loading overlay.
			document.getElementById('loading-overlay').style.display = 'none';
			CanvasWrapper.show();

			CanvasWrapper.resize();
			// Start the rendering loop!
			gooRunner.startGameLoop();
			gooRunner.renderer.domElement.focus();
		}).then(null, function (e) {
			// If something goes wrong, 'e' is the error message from the engine.
			alert('Failed to load project: ' + e);
		});
	}

	function initGoo() {
		// Create typical Goo application.
		var gooRunner = new GooRunner({
			antialias: true,
			manuallyStartGameLoop: true,
			useDevicePixelRatio: true
		});

		gooRunner.world.add(new StateMachineSystem(gooRunner));
		gooRunner.world.add(new HtmlSystem(gooRunner.renderer));
		gooRunner.world.add(new TimelineSystem());

		return gooRunner;
	}


	function loadProject(gooRunner) {
		/**
		 * Callback for the loading screen.
		 *
		 * @param  {number} handled
		 * @param  {number} total
		 */
		var progressCallback = function (handled, total) {
			var loadedPercent = (100 * handled / total).toFixed();
			var loadingOverlay = document.getElementById("loading-overlay");
			var progressBar = document.getElementById("progress-bar");
			var progress = document.getElementById("progress");
			var loadingMessage = document.getElementById("loading-message");

			loadingOverlay.style.display = "block";
			loadingMessage.style.display = "block";
			progressBar.style.display = "block";
			progress.style.width = loadedPercent + "%";
		};

		// The loader takes care of loading the data.
		var loader = new DynamicLoader({
			world: gooRunner.world,
			rootPath: 'res'
		});

		return loader.load('root.bundle', {
			preloadBinaries: true,
			progressCallback: progressCallback
		}).then(function(result) {
			var project = null;

			// Try to get the first project in the bundle.
			for (var key in result) {
				if (/\.project$/.test(key)) {
					project = result[key];
					break;
				}
			}

			if (!project || !project.id) {
				alert('Error: No project in bundle'); // Should never happen.
				return null;
			}

			// Setup the canvas configuration (sizing mode, resolution, aspect
			// ratio, etc).
			var scene = result[project.mainSceneRef];
			var canvasConfig = scene ? scene.canvas : {};
			CanvasWrapper.setup(gooRunner.renderer.domElement, canvasConfig);
			CanvasWrapper.add();
			CanvasWrapper.hide();

			return loader.load(project.id);
		});
	}
	init();
});
