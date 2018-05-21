webpackJsonp([0],[
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict'


	// 3rd party modules:
	const angular = __webpack_require__(1)
	const lodash = __webpack_require__(3)
	const router = __webpack_require__(5)
	__webpack_require__(6)
	__webpack_require__(8)
	__webpack_require__(10)
	__webpack_require__(11)

	const pagesTpl = __webpack_require__(12)

	// Local modules:
	__webpack_require__(13)
	__webpack_require__(15)
	__webpack_require__(19)
	__webpack_require__(29)

	const $ = __webpack_require__(26)

	// Create App:
	angular.module('app', [
		'ui.router',
		'app.data',
		'app.page',
		'app.nav',
		'app.artboard',
		'ngMaterial'
	]).config(['$stateProvider', '$urlRouterProvider', '$mdThemingProvider', function( $stateProvider, $urlRouterProvider, $mdThemingProvider ){

		// Theming 
		$mdThemingProvider.theme('header')
			.primaryPalette('grey')
			.dark()

		// URL Routing:
		$urlRouterProvider.otherwise('/pages')
		$stateProvider
			.state('pages', {
				url: '/pages',
				views: {
					nav: {
						template: '<navbar></navbar>'
					},
					content: {
						template: pagesTpl
					}
				}
			})
			.state('pages.page', {
				url: '/:id',
				views: {
					page: {
						template: '<page flex="100" layout="column" page-id="{{pageId}}"></page>',
						controller: ['$scope', '$stateParams', function( $scope, $stateParams ){
							// console.log('Pages page')
							$scope.pageId = $stateParams.id
						}]
					}
				}
			})
			.state('pages.page.artboard', {
				url: '/:artboard',
				views: {
					'page@pages': {
						template: '<artboard flex="100" layout="column" page-id="{{pageId}}" artboard-id="{{artboardId}}"></artboard>',
						controller: ['$scope', '$stateParams', function( $scope, $stateParams ){
							console.log('Artboard')
							$scope.pageId = $stateParams.id
							$scope.artboardId = $stateParams.artboard
						}]
					}
				}
			})


	}])
	.controller('app.main', ['$scope', '$state', '$rootScope', 'dataService', function( $scope, $state, $rootScope, dataService ){

		$scope.data = dataService.data
		if($scope.data.returned) redirectIfNoCurrentPage()
		$scope.$watch('data.returned', function(){
			if(lodash.isEmpty( $scope.data.pages ) ) return false
			redirectIfNoCurrentPage()
		})

		function redirectIfNoCurrentPage(){
			if( lodash.isEmpty( lodash.get( $state, 'current.params.id', null ) ) ){
				$state.go('pages.page', { id: $scope.data.pages[0].id })
				$scope.data.updateCurrentPage()
			}
		}
		

		$(window).keydown(function(e){
			if(e.metaKey && ( e.keyCode == 187 || e.keyCode == 189 )){
				e.preventDefault()
				let direction = 'in'
				if( e.keyCode == 189 )
					direction = 'out'
				$rootScope.$emit('zoom', { direction: direction, event: e })
			}
		})

	}])



/***/ }),
/* 1 */,
/* 2 */,
/* 3 */,
/* 4 */,
/* 5 */,
/* 6 */,
/* 7 */,
/* 8 */,
/* 9 */,
/* 10 */
/***/ (function(module, exports) {

	/*! angular-panhandler - v1.1.1 - 2015-08-07
	* Copyright (c) 2015 ; Licensed MIT %> */
	(function(){
	  'use strict';
	  angular.module('panhandler', [])
	    .directive('panhandler', ['$document', function PanhandlerFactory($document) {
	      function Panhandler ($el, attr, $scope) {
	        this.$el = $el;
	        this.contentWidth = attr.contentWidth;
	        this.contentHeight = attr.contentHeight;

	        this.curr = [];
	        this.origin = [];
	        this.startPos = [];
	        this.pos = [0,0];

	        this.touch = ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch;
	        this.has3d = has3d();
	        this.overEvent = 'mouseover';
	        this.downEvent = this.touch ? 'touchstart':'mousedown';
	        this.upEvent = this.touch ? 'touchend':'mouseup';
	        this.moveEvent = this.touch ? 'touchmove':'mousemove';
	        this.noTouch = vendorize('user-select', 'none');

	        this.$scope = $scope;

	        this.startBind = angular.bind(this,this.startDrag);
	        this.endBind = angular.bind(this,this.endDrag);
	        this.updateBind = angular.bind(this,this.updateDrag);
	        this.mouseOutBind = angular.bind(this,this.mouseOut);
	        this.mouseOverBind = angular.bind(this,this.mouseOver);

	        this.init();
	      }
	      Panhandler.prototype = {
	        init: function(){
	          this.$el.css('overflow','hidden');
	          this.draggable = angular.element('<div class="panhandler-wrap"></div>');
	          this.draggable.css(this.noTouch);
	          if(this.contentWidth){
	            this.draggable.css('width', this.contentWidth);
	          }
	          if(this.contentHeight){
	            this.draggable.css('height', this.contentHeight);
	          }
	          this.grabCursor();
	          angular.forEach(this.$el.contents(),angular.bind(this,function(c){
	            this.draggable.append(c);
	          }));
	          this.draggable.append('<div style="clear:both;"></div>');
	          this.$el.append(this.draggable);
	          this.makeInteractive();
	        },
	        tick: function(){
	          if(this.origin.length && this.dirty){
	            this.updatePosition();
	            this.dirty = false;
	          }
	          this.loop = window.requestAnimationFrame(angular.bind(this,this.tick));
	        },
	        updatePosition: function(){
	          var x = this.clampX(this.startPos[0] + (this.curr[0] - this.origin[0]));
	          var y = this.clampY(this.startPos[1] + (this.curr[1] - this.origin[1]));
	          this.pos = [x,y];
	          if(this.has3d){
	            var trans = vendorize('transform','translate3d(' + x + 'px,' + y + 'px, 0)');
	            this.draggable.css(trans);
	          }else{
	            this.draggable.css('margin-left',x + 'px');
	            this.draggable.css('margin-top',y + 'px');
	          }
	        },
	        clampX: function(val){
	          return Math.max(Math.min(0,val),this.minX);
	        },
	        clampY: function(val){
	          return Math.max(Math.min(0,val),this.minY);
	        },
	        cacheBounds: function(){
	          this.contentDimensions = [getWidth(this.draggable),getHeight(this.draggable)];
	          this.viewDimensions = [getOffsetWidth(this.$el),getOffsetHeight(this.$el)];
	          this.minX = Math.min(this.viewDimensions[0] - this.contentDimensions[0],0);
	          this.minY = Math.min(this.viewDimensions[1] - this.contentDimensions[1],0);
	        },
	        isPrevented: function () {
	          return this.$scope.preventPan === true || this.$scope.preventPan === 'true';
	        },
	        startDrag: function(e){
	          if (this.isPrevented()) {
	            return false;
	          }
	          if ( this.findParentNoScroll(e.target, 'iCannotScroll') ) {
	            return false;
	          }
	          this.origin = this.positionFromEvent(e);
	          this.startPos = [this.pos[0],this.pos[1]];
	          this.cacheBounds();
	          this.grabbingCursor();
	          $document.on(this.moveEvent,this.updateBind);
	          $document.on(this.upEvent,this.endBind);
	          this.$el.on('mouseout',this.mouseOutBind);
	          this.updateDrag(e);
	          this.tick();
	        },
	        findParentNoScroll: function(el, cls){
	          while ( !el.classList.contains(cls) && (el = el.parentElement) && !el.classList.contains(cls));
	          return el;
	        },
	        updateDrag: function(e){
	          var curr = this.positionFromEvent(e);
	          if(curr[0] !== this.curr[0] || curr[1] !== this.curr[1]){
	            this.dirty = true;
	            this.curr = [curr[0],curr[1]];
	          }
	        },
	        endDrag: function(){
	          this.origin = [];
	          this.curr = [];
	          this.grabCursor();
	          $document.off(this.moveEvent,this.updateBind);
	          $document.off(this.upEvent,this.endBind);
	          this.$el.off('mouseout',this.mouseOutBind);
	          window.cancelAnimationFrame(this.loop);
	        },
	        positionFromEvent: function(e){
	          return [
	            e.pageX || e.originalEvent.touches[0].pageX,
	            e.pageY || e.originalEvent.touches[0].pageY
	          ];
	        },
	        makeInteractive: function(){
	          this.draggable.on(this.downEvent,this.startBind);
	          if (!this.touch) {
	            this.draggable.on(this.overEvent,this.mouseOverBind);
	          }
	          this.$el.on('$destroy',this.destroy);
	        },
	        mouseOver: function (e) {
	          this.grabCursor();
	        },
	        mouseOut: function(e){
	          var el = e.target;
	          var isParent = el.querySelector && el.querySelector('.panhandler-wrap');
	          if(isParent || e.toElement === undefined || e.toElement.tagName === 'HTML'){
	            this.endDrag();
	          }
	        },
	        destroy: function(){
	          if(this.loop){
	            window.cancelAnimationFrame(this.loop);
	          }
	          $document.off(this.upEvent,this.endBind);
	        },
	        grabCursor: function(){
	          var isWk = navigator.userAgent.match(/WebKit/);
	          var isFF = navigator.userAgent.match(/Gecko/);
	          var cursor = 'move';
	          if (this.isPrevented()) {
	            cursor = '';
	          } else if (isWk) {
	            cursor = '-webkit-grab';
	          }else if(isFF){
	            cursor = '-moz-grab';
	          }
	          this.draggable.css('cursor',cursor);
	        },
	        grabbingCursor: function(){
	          var isWk = navigator.userAgent.match(/WebKit/);
	          var isFF = navigator.userAgent.match(/Gecko/);
	          if(isWk){
	            this.draggable.css('cursor','-webkit-grabbing');
	          }else if(isFF){
	            this.draggable.css('cursor','-moz-grabbing');
	          }else{
	            this.draggable.css('cursor','move');
	          }
	        }
	      };
	      return {
	        restrict: 'AC',
	        scope: {
	          preventPan: '@preventPan'
	        },
	        link: function link(scope,element,attr){
	          setTimeout(function(){
	            new Panhandler(element, attr, scope);
	          });
	        }
	      };
	    }]);

	    // Util
	    function getWidth($el){
	      return $el[0].scrollWidth;
	    }
	    function getHeight($el){
	      return $el[0].scrollHeight;
	    }
	    function getOffsetWidth($el){
	      if(typeof $el.width === 'function'){
	        return $el.offsetParent().width();
	      }else{
	        return $el[0].offsetWidth;
	      }
	    }
	    function getOffsetHeight($el){
	      if(typeof $el.height === 'function'){
	        return $el.offsetParent().height();
	      }else{
	        return $el[0].offsetHeight;
	      }
	    }
	    function hashString(str){
	      var hash = 0, i, ch, l;
	      if (str.length === 0) return hash;
	      for (i = 0, l = str.length; i < l; i++) {
	        ch  = str.charCodeAt(i);
	        hash  = ((hash<<5)-hash)+ch;
	        hash |= 0; // Convert to 32bit integer
	      }
	      return hash;
	    }

	    // Prefix CSS
	    var vendorize = (function(){
	      var vendors = ['-webkit-','-moz-','-ms-',''];
	      return function vendorize(prop,val){
	        var out = {};
	        angular.forEach(vendors,function(v){
	          out[v + prop] = val;
	        });
	        return out;
	      };
	    }());

	    // Request Animation Frame Polyfill
	    (function() {
	        var lastTime = 0;
	        var vendors = ['webkit', 'moz'];
	        for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
	            window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
	            window.cancelAnimationFrame =
	              window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
	        }

	        if (!window.requestAnimationFrame)
	            window.requestAnimationFrame = function(callback, element) {
	                var currTime = new Date().getTime();
	                var timeToCall = Math.max(0, 16 - (currTime - lastTime));
	                var id = window.setTimeout(function() { callback(currTime + timeToCall); },
	                  timeToCall);
	                lastTime = currTime + timeToCall;
	                return id;
	            };

	        if (!window.cancelAnimationFrame)
	            window.cancelAnimationFrame = function(id) {
	                clearTimeout(id);
	            };
	    }());

	    // Modernizr test for 3D Transforms
	    function has3d() {
	      var el = document.createElement('p'), doeshave, transforms = {
	        'webkitTransform':'-webkit-transform',
	        'OTransform':'-o-transform',
	        'msTransform':'-ms-transform',
	        'MozTransform':'-moz-transform',
	        'transform':'transform'
	      };
	      // Add it to the body to get the computed style.
	      document.body.insertBefore(el, null);
	      for (var t in transforms) {
	        if (el.style[t] !== undefined) {
	          el.style[t] = "translate3d(1px,1px,1px)";
	          doeshave = window.getComputedStyle(el).getPropertyValue(transforms[t]);
	        }
	      }
	      document.body.removeChild(el);
	      return (doeshave !== undefined && doeshave.length > 0 && doeshave !== "none");
	    }
	}());


/***/ }),
/* 11 */,
/* 12 */
/***/ (function(module, exports) {

	module.exports = "<section ui-view=\"page\" layout=\"column\" flex>\n\t\n\t<h1>Select a Page to view</h1>\n\n</section>"

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

	// data modules components:

	var service = __webpack_require__(14);



	module.exports = angular.module('app.data', [])
		.service('dataService', [ '$http', '$state', service ]);

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

	
	const lodash = __webpack_require__(3)

	module.exports = function( $http, $state ){
		return {
			data: {
				returned: false,
				scale: 100,
				pages: [],
				currentPage: 0,
				updateCurrentPage: function(){
					if( this.pages.length < 1 ) return false
					this.currentPage = lodash.indexOf( this.pages, lodash.find( this.pages, { id: $state.params.id }))
					if( this.currentPage == -1 ) this.currentPage = 0
				}
			},
			get: function( callback ){
				console.log('getting..', this)
				return $http({
					method: 'GET',
					withCredentials: true,
					url: 'data.json'
				}).then(( res ) => {
					this.data.pages = lodash.reject(res.data.pages, { name: 'Symbols' })
					this.data.updateCurrentPage()
					this.data.returned = true
				})
			}
		};
	};

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

	// nav modules components:

	const controller = __webpack_require__(16)
	const directive = __webpack_require__(17)

	module.exports = angular.module('app.nav', [] )
		.controller( 'navCtrl', [ '$scope', '$state', 'dataService', controller ] )
		.directive( 'navbar', [ directive ] )


/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

	// pages controller:

	const lodash = __webpack_require__(3)

	module.exports = ( $scope, $state, dataService ) => {

		var self = this

		console.log('SS', $state.params.id)

		this.data = {}
		this.data = dataService.data

		dataService.get()

		return this

	}

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

	
	const directiveTemplate = __webpack_require__(18)

	module.exports = () => {
		
		return {
			scope: { },
			restrict: 'E',
			replace: false,
			template: directiveTemplate,
			controller: 'navCtrl',
			controllerAs: 'ctrl'
		}

	}

/***/ }),
/* 18 */
/***/ (function(module, exports) {

	module.exports = "<div id=\"navbar-wrapper\">\n\t<div id=\"navbar\">\n\t\t<md-tabs md-border-bottom md-selected=\"ctrl.data.currentPage\" tabs-aria-label=\"navigation links\">\n\t\t\t<md-tab ui-sref=\"pages.page({id: '{{page.id}}' })\" name=\"{{i}}\" ng-repeat=\"(i, page) in ctrl.data.pages\">{{page.name}} </md-tab>\n\t\t</md-tabs>\n\t</div>\n</div>"

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

	// page modules components:

	const controller = __webpack_require__(20)
	const directive = __webpack_require__(27)

	module.exports = angular.module('app.page', [] )
		.controller( 'pageCtrl', [ '$scope', 'dataService', '$rootScope', '$state', controller ] )
		.directive( 'page', [ directive ] )


/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

	// page controller:

	const lodash 				= __webpack_require__(3)
	const q 					= __webpack_require__(21)
	const Hamster 				= __webpack_require__(25)
	const $ 					= __webpack_require__(26)

	module.exports = ( $scope, dataService, $rootScope, $state ) => {


		const ZOOM_PER_TICK = 20
		const INITIAL_SCALE = 80
		const TEXT_FILL_OFFSET = 40


		$scope.data = dataService.data
		$scope.page = {}
		let self = {}
		let maxx, maxy;

		$scope.minScale = 20
		$scope.maxScale = 400

		let boardContents = $('#boardcontents')
		let boardlayout = $('#boardlayout')
		$scope.data.scale 	= INITIAL_SCALE

		let boardlayoutWidth = parseInt( boardlayout.width(), false ) || 0
		let boardlayoutHeight = parseInt( boardlayout.height(), false ) || 0

		$scope.dblClick = function( board ){
			console.log('Board:', board)
			$state.go('pages.page.artboard', {
				id: $scope.page.id,
				artboard: board.id
			})
		}

		if($scope.data.returned){
			kickOff()
		}
		$scope.$watch('data.returned', function(){
			if(lodash.isEmpty( $scope.data.pages ) ) return false
			kickOff()
		})

		function centerContents(){
			updateLayoutWidth()
			if(boardlayoutWidth == 0){
				setTimeout( centerContents.bind( this ), 40 )
			}
			// If the content is bigger than the page width:
			if( boardlayoutWidth < maxx ) return false

			let midCont = ( maxx / 2 ) * ( $scope.data.scale / 100 )
			boardContents.css({
				left: ( ( boardlayoutWidth / 2 ) - midCont )
			})
		}

		function kickOff(){

			let page = lodash.find( $scope.data.pages, { id: $scope.pageId })

			let minx = lodash.min( lodash.map( page.artboards, ( b ) => lodash.get(b, 'rect.x') ) )
			let miny = lodash.min( lodash.map( page.artboards, ( b ) => lodash.get(b, 'rect.y') ) )

			// console.log('xx', )
			maxx = ( lodash.max( lodash.map( page.artboards, ( b ) => b.rect.x + b.rect.width ) ) + Math.abs(minx) )
			maxy = ( lodash.max( lodash.map( page.artboards, ( b ) => b.rect.y + b.rect.height ) ) + Math.abs(miny) )

			boardContents.css({ width: maxx, height: maxy })

			updateLayoutWidth()
			page.artboards = lodash.map( page.artboards, ( board ) => {
				board.rect.x -= minx
				board.rect.y -= miny
				return board
			})
			$scope.page = page
			centerContents()

		}


		boardlayout.bind('mousemove', function( e ){
			self.panEndX = e.pageX
			self.panEndY = e.pageY
			if(self.mouseDown){
				var pageTop = self.pageTop
				var pageLeft = self.pageLeft
				self.panTop = self.panEndY - self.panStartY
				self.panLeft = self.panEndX - self.panStartX
				pageTop += self.panTop
				pageLeft += self.panLeft
				boardContents.css({ top: pageTop, left: pageLeft })
			}
		})
		boardlayout.bind('mousedown', function( e ){
			e.preventDefault()
			self.panStartX = e.pageX
			self.panStartY = e.pageY
			self.pageTop = parseInt(boardContents.css('top'), false) || 0
			self.pageLeft = parseInt(boardContents.css('left'), false) || 0
			self.mouseDown = true
		})
		boardlayout.bind('mouseup', function(){
			self.mouseDown = false
		})

		function updateLayoutWidth(){
			boardlayoutWidth = parseInt( boardlayout.width(), false ) || 0
			boardlayoutHeight = parseInt( boardlayout.height(), false ) || 0
		}

		$scope.didChange = function(){
			scalePage()
		}

		$rootScope.$on('zoom', ( e, params ) => {
			const { direction, event } = params
			directionScale( direction )
			$scope.$apply()
		})

		$scope.clickZoom = function( direction ){
			directionScale( direction )
		}

		function directionScale( direction ){
			if(direction == 'in')
				$scope.data.scale += ZOOM_PER_TICK
			else
				$scope.data.scale -= ZOOM_PER_TICK
			scalePage()
		}
		
		Hamster( boardlayout[0] ).wheel(function( event, delta, deltaX, deltaY ){
			$scope.data.scale += deltaY
			scalePage()
			$scope.$apply()
		})

		function scalePage(){

			updateLayoutWidth()
			
			let offset = boardContents.offset()
			let pageWidth = parseInt(boardContents.css('width'), false) || 0
			let pageHeight = parseInt(boardContents.css('height'), false) || 0

			offset.top = offset.top - 49 // top bar has to be counted
			offset.left = offset.left - ( offset.left * 2 )
			offset.top = offset.top - ( offset.top * 2 )

			let halfScreenx = ( boardlayoutWidth / 2 )
			let halfScreeny = ( boardlayoutHeight / 2 )
			let toLeft =  ( offset.left + halfScreenx )
			let toTop =  ( offset.top + halfScreeny )

			
			if( $scope.data.scale <= $scope.minScale ) $scope.data.scale = $scope.minScale+0
			if( $scope.data.scale >= $scope.maxScale ) $scope.data.scale = $scope.maxScale+0
			// $scope.data.scale = parseFloat( parseFloat($scope.data.scale).toFixed(2) )

			let offsetPercx = ( toLeft / pageWidth )
			let offsetPercy = ( toTop / pageHeight )
			let newToLeft = ( ( ( ( maxx * ( $scope.data.scale / 100 ) ) * offsetPercx ) - halfScreenx ) )
			let newToTop = ( ( ( ( maxy * ( $scope.data.scale / 100 ) ) * offsetPercy ) - halfScreeny ) )

			newToLeft = newToLeft - ( newToLeft * 2 )
			newToTop = newToTop - ( newToTop * 2 )

			// console.log('SET', $scope.data.scale, `${toLeft}px 600px`)
			boardContents.css({
				left: `${newToLeft}px`,
				top: `${newToTop}px`,
				transform: `scale(${$scope.data.scale/100},${$scope.data.scale/100})`
			})

		}

	}

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process, setImmediate) {// vim:ts=4:sts=4:sw=4:
	/*!
	 *
	 * Copyright 2009-2017 Kris Kowal under the terms of the MIT
	 * license found at https://github.com/kriskowal/q/blob/v1/LICENSE
	 *
	 * With parts by Tyler Close
	 * Copyright 2007-2009 Tyler Close under the terms of the MIT X license found
	 * at http://www.opensource.org/licenses/mit-license.html
	 * Forked at ref_send.js version: 2009-05-11
	 *
	 * With parts by Mark Miller
	 * Copyright (C) 2011 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 * http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 *
	 */

	(function (definition) {
	    "use strict";

	    // This file will function properly as a <script> tag, or a module
	    // using CommonJS and NodeJS or RequireJS module formats.  In
	    // Common/Node/RequireJS, the module exports the Q API and when
	    // executed as a simple <script>, it creates a Q global instead.

	    // Montage Require
	    if (typeof bootstrap === "function") {
	        bootstrap("promise", definition);

	    // CommonJS
	    } else if (true) {
	        module.exports = definition();

	    // RequireJS
	    } else if (typeof define === "function" && define.amd) {
	        define(definition);

	    // SES (Secure EcmaScript)
	    } else if (typeof ses !== "undefined") {
	        if (!ses.ok()) {
	            return;
	        } else {
	            ses.makeQ = definition;
	        }

	    // <script>
	    } else if (typeof window !== "undefined" || typeof self !== "undefined") {
	        // Prefer window over self for add-on scripts. Use self for
	        // non-windowed contexts.
	        var global = typeof window !== "undefined" ? window : self;

	        // Get the `window` object, save the previous Q global
	        // and initialize Q as a global.
	        var previousQ = global.Q;
	        global.Q = definition();

	        // Add a noConflict function so Q can be removed from the
	        // global namespace.
	        global.Q.noConflict = function () {
	            global.Q = previousQ;
	            return this;
	        };

	    } else {
	        throw new Error("This environment was not anticipated by Q. Please file a bug.");
	    }

	})(function () {
	"use strict";

	var hasStacks = false;
	try {
	    throw new Error();
	} catch (e) {
	    hasStacks = !!e.stack;
	}

	// All code after this point will be filtered from stack traces reported
	// by Q.
	var qStartingLine = captureLine();
	var qFileName;

	// shims

	// used for fallback in "allResolved"
	var noop = function () {};

	// Use the fastest possible means to execute a task in a future turn
	// of the event loop.
	var nextTick =(function () {
	    // linked list of tasks (single, with head node)
	    var head = {task: void 0, next: null};
	    var tail = head;
	    var flushing = false;
	    var requestTick = void 0;
	    var isNodeJS = false;
	    // queue for late tasks, used by unhandled rejection tracking
	    var laterQueue = [];

	    function flush() {
	        /* jshint loopfunc: true */
	        var task, domain;

	        while (head.next) {
	            head = head.next;
	            task = head.task;
	            head.task = void 0;
	            domain = head.domain;

	            if (domain) {
	                head.domain = void 0;
	                domain.enter();
	            }
	            runSingle(task, domain);

	        }
	        while (laterQueue.length) {
	            task = laterQueue.pop();
	            runSingle(task);
	        }
	        flushing = false;
	    }
	    // runs a single function in the async queue
	    function runSingle(task, domain) {
	        try {
	            task();

	        } catch (e) {
	            if (isNodeJS) {
	                // In node, uncaught exceptions are considered fatal errors.
	                // Re-throw them synchronously to interrupt flushing!

	                // Ensure continuation if the uncaught exception is suppressed
	                // listening "uncaughtException" events (as domains does).
	                // Continue in next event to avoid tick recursion.
	                if (domain) {
	                    domain.exit();
	                }
	                setTimeout(flush, 0);
	                if (domain) {
	                    domain.enter();
	                }

	                throw e;

	            } else {
	                // In browsers, uncaught exceptions are not fatal.
	                // Re-throw them asynchronously to avoid slow-downs.
	                setTimeout(function () {
	                    throw e;
	                }, 0);
	            }
	        }

	        if (domain) {
	            domain.exit();
	        }
	    }

	    nextTick = function (task) {
	        tail = tail.next = {
	            task: task,
	            domain: isNodeJS && process.domain,
	            next: null
	        };

	        if (!flushing) {
	            flushing = true;
	            requestTick();
	        }
	    };

	    if (typeof process === "object" &&
	        process.toString() === "[object process]" && process.nextTick) {
	        // Ensure Q is in a real Node environment, with a `process.nextTick`.
	        // To see through fake Node environments:
	        // * Mocha test runner - exposes a `process` global without a `nextTick`
	        // * Browserify - exposes a `process.nexTick` function that uses
	        //   `setTimeout`. In this case `setImmediate` is preferred because
	        //    it is faster. Browserify's `process.toString()` yields
	        //   "[object Object]", while in a real Node environment
	        //   `process.toString()` yields "[object process]".
	        isNodeJS = true;

	        requestTick = function () {
	            process.nextTick(flush);
	        };

	    } else if (typeof setImmediate === "function") {
	        // In IE10, Node.js 0.9+, or https://github.com/NobleJS/setImmediate
	        if (typeof window !== "undefined") {
	            requestTick = setImmediate.bind(window, flush);
	        } else {
	            requestTick = function () {
	                setImmediate(flush);
	            };
	        }

	    } else if (typeof MessageChannel !== "undefined") {
	        // modern browsers
	        // http://www.nonblocking.io/2011/06/windownexttick.html
	        var channel = new MessageChannel();
	        // At least Safari Version 6.0.5 (8536.30.1) intermittently cannot create
	        // working message ports the first time a page loads.
	        channel.port1.onmessage = function () {
	            requestTick = requestPortTick;
	            channel.port1.onmessage = flush;
	            flush();
	        };
	        var requestPortTick = function () {
	            // Opera requires us to provide a message payload, regardless of
	            // whether we use it.
	            channel.port2.postMessage(0);
	        };
	        requestTick = function () {
	            setTimeout(flush, 0);
	            requestPortTick();
	        };

	    } else {
	        // old browsers
	        requestTick = function () {
	            setTimeout(flush, 0);
	        };
	    }
	    // runs a task after all other tasks have been run
	    // this is useful for unhandled rejection tracking that needs to happen
	    // after all `then`d tasks have been run.
	    nextTick.runAfter = function (task) {
	        laterQueue.push(task);
	        if (!flushing) {
	            flushing = true;
	            requestTick();
	        }
	    };
	    return nextTick;
	})();

	// Attempt to make generics safe in the face of downstream
	// modifications.
	// There is no situation where this is necessary.
	// If you need a security guarantee, these primordials need to be
	// deeply frozen anyway, and if you don’t need a security guarantee,
	// this is just plain paranoid.
	// However, this **might** have the nice side-effect of reducing the size of
	// the minified code by reducing x.call() to merely x()
	// See Mark Miller’s explanation of what this does.
	// http://wiki.ecmascript.org/doku.php?id=conventions:safe_meta_programming
	var call = Function.call;
	function uncurryThis(f) {
	    return function () {
	        return call.apply(f, arguments);
	    };
	}
	// This is equivalent, but slower:
	// uncurryThis = Function_bind.bind(Function_bind.call);
	// http://jsperf.com/uncurrythis

	var array_slice = uncurryThis(Array.prototype.slice);

	var array_reduce = uncurryThis(
	    Array.prototype.reduce || function (callback, basis) {
	        var index = 0,
	            length = this.length;
	        // concerning the initial value, if one is not provided
	        if (arguments.length === 1) {
	            // seek to the first value in the array, accounting
	            // for the possibility that is is a sparse array
	            do {
	                if (index in this) {
	                    basis = this[index++];
	                    break;
	                }
	                if (++index >= length) {
	                    throw new TypeError();
	                }
	            } while (1);
	        }
	        // reduce
	        for (; index < length; index++) {
	            // account for the possibility that the array is sparse
	            if (index in this) {
	                basis = callback(basis, this[index], index);
	            }
	        }
	        return basis;
	    }
	);

	var array_indexOf = uncurryThis(
	    Array.prototype.indexOf || function (value) {
	        // not a very good shim, but good enough for our one use of it
	        for (var i = 0; i < this.length; i++) {
	            if (this[i] === value) {
	                return i;
	            }
	        }
	        return -1;
	    }
	);

	var array_map = uncurryThis(
	    Array.prototype.map || function (callback, thisp) {
	        var self = this;
	        var collect = [];
	        array_reduce(self, function (undefined, value, index) {
	            collect.push(callback.call(thisp, value, index, self));
	        }, void 0);
	        return collect;
	    }
	);

	var object_create = Object.create || function (prototype) {
	    function Type() { }
	    Type.prototype = prototype;
	    return new Type();
	};

	var object_defineProperty = Object.defineProperty || function (obj, prop, descriptor) {
	    obj[prop] = descriptor.value;
	    return obj;
	};

	var object_hasOwnProperty = uncurryThis(Object.prototype.hasOwnProperty);

	var object_keys = Object.keys || function (object) {
	    var keys = [];
	    for (var key in object) {
	        if (object_hasOwnProperty(object, key)) {
	            keys.push(key);
	        }
	    }
	    return keys;
	};

	var object_toString = uncurryThis(Object.prototype.toString);

	function isObject(value) {
	    return value === Object(value);
	}

	// generator related shims

	// FIXME: Remove this function once ES6 generators are in SpiderMonkey.
	function isStopIteration(exception) {
	    return (
	        object_toString(exception) === "[object StopIteration]" ||
	        exception instanceof QReturnValue
	    );
	}

	// FIXME: Remove this helper and Q.return once ES6 generators are in
	// SpiderMonkey.
	var QReturnValue;
	if (typeof ReturnValue !== "undefined") {
	    QReturnValue = ReturnValue;
	} else {
	    QReturnValue = function (value) {
	        this.value = value;
	    };
	}

	// long stack traces

	var STACK_JUMP_SEPARATOR = "From previous event:";

	function makeStackTraceLong(error, promise) {
	    // If possible, transform the error stack trace by removing Node and Q
	    // cruft, then concatenating with the stack trace of `promise`. See #57.
	    if (hasStacks &&
	        promise.stack &&
	        typeof error === "object" &&
	        error !== null &&
	        error.stack
	    ) {
	        var stacks = [];
	        for (var p = promise; !!p; p = p.source) {
	            if (p.stack && (!error.__minimumStackCounter__ || error.__minimumStackCounter__ > p.stackCounter)) {
	                object_defineProperty(error, "__minimumStackCounter__", {value: p.stackCounter, configurable: true});
	                stacks.unshift(p.stack);
	            }
	        }
	        stacks.unshift(error.stack);

	        var concatedStacks = stacks.join("\n" + STACK_JUMP_SEPARATOR + "\n");
	        var stack = filterStackString(concatedStacks);
	        object_defineProperty(error, "stack", {value: stack, configurable: true});
	    }
	}

	function filterStackString(stackString) {
	    var lines = stackString.split("\n");
	    var desiredLines = [];
	    for (var i = 0; i < lines.length; ++i) {
	        var line = lines[i];

	        if (!isInternalFrame(line) && !isNodeFrame(line) && line) {
	            desiredLines.push(line);
	        }
	    }
	    return desiredLines.join("\n");
	}

	function isNodeFrame(stackLine) {
	    return stackLine.indexOf("(module.js:") !== -1 ||
	           stackLine.indexOf("(node.js:") !== -1;
	}

	function getFileNameAndLineNumber(stackLine) {
	    // Named functions: "at functionName (filename:lineNumber:columnNumber)"
	    // In IE10 function name can have spaces ("Anonymous function") O_o
	    var attempt1 = /at .+ \((.+):(\d+):(?:\d+)\)$/.exec(stackLine);
	    if (attempt1) {
	        return [attempt1[1], Number(attempt1[2])];
	    }

	    // Anonymous functions: "at filename:lineNumber:columnNumber"
	    var attempt2 = /at ([^ ]+):(\d+):(?:\d+)$/.exec(stackLine);
	    if (attempt2) {
	        return [attempt2[1], Number(attempt2[2])];
	    }

	    // Firefox style: "function@filename:lineNumber or @filename:lineNumber"
	    var attempt3 = /.*@(.+):(\d+)$/.exec(stackLine);
	    if (attempt3) {
	        return [attempt3[1], Number(attempt3[2])];
	    }
	}

	function isInternalFrame(stackLine) {
	    var fileNameAndLineNumber = getFileNameAndLineNumber(stackLine);

	    if (!fileNameAndLineNumber) {
	        return false;
	    }

	    var fileName = fileNameAndLineNumber[0];
	    var lineNumber = fileNameAndLineNumber[1];

	    return fileName === qFileName &&
	        lineNumber >= qStartingLine &&
	        lineNumber <= qEndingLine;
	}

	// discover own file name and line number range for filtering stack
	// traces
	function captureLine() {
	    if (!hasStacks) {
	        return;
	    }

	    try {
	        throw new Error();
	    } catch (e) {
	        var lines = e.stack.split("\n");
	        var firstLine = lines[0].indexOf("@") > 0 ? lines[1] : lines[2];
	        var fileNameAndLineNumber = getFileNameAndLineNumber(firstLine);
	        if (!fileNameAndLineNumber) {
	            return;
	        }

	        qFileName = fileNameAndLineNumber[0];
	        return fileNameAndLineNumber[1];
	    }
	}

	function deprecate(callback, name, alternative) {
	    return function () {
	        if (typeof console !== "undefined" &&
	            typeof console.warn === "function") {
	            console.warn(name + " is deprecated, use " + alternative +
	                         " instead.", new Error("").stack);
	        }
	        return callback.apply(callback, arguments);
	    };
	}

	// end of shims
	// beginning of real work

	/**
	 * Constructs a promise for an immediate reference, passes promises through, or
	 * coerces promises from different systems.
	 * @param value immediate reference or promise
	 */
	function Q(value) {
	    // If the object is already a Promise, return it directly.  This enables
	    // the resolve function to both be used to created references from objects,
	    // but to tolerably coerce non-promises to promises.
	    if (value instanceof Promise) {
	        return value;
	    }

	    // assimilate thenables
	    if (isPromiseAlike(value)) {
	        return coerce(value);
	    } else {
	        return fulfill(value);
	    }
	}
	Q.resolve = Q;

	/**
	 * Performs a task in a future turn of the event loop.
	 * @param {Function} task
	 */
	Q.nextTick = nextTick;

	/**
	 * Controls whether or not long stack traces will be on
	 */
	Q.longStackSupport = false;

	/**
	 * The counter is used to determine the stopping point for building
	 * long stack traces. In makeStackTraceLong we walk backwards through
	 * the linked list of promises, only stacks which were created before
	 * the rejection are concatenated.
	 */
	var longStackCounter = 1;

	// enable long stacks if Q_DEBUG is set
	if (typeof process === "object" && process && process.env && process.env.Q_DEBUG) {
	    Q.longStackSupport = true;
	}

	/**
	 * Constructs a {promise, resolve, reject} object.
	 *
	 * `resolve` is a callback to invoke with a more resolved value for the
	 * promise. To fulfill the promise, invoke `resolve` with any value that is
	 * not a thenable. To reject the promise, invoke `resolve` with a rejected
	 * thenable, or invoke `reject` with the reason directly. To resolve the
	 * promise to another thenable, thus putting it in the same state, invoke
	 * `resolve` with that other thenable.
	 */
	Q.defer = defer;
	function defer() {
	    // if "messages" is an "Array", that indicates that the promise has not yet
	    // been resolved.  If it is "undefined", it has been resolved.  Each
	    // element of the messages array is itself an array of complete arguments to
	    // forward to the resolved promise.  We coerce the resolution value to a
	    // promise using the `resolve` function because it handles both fully
	    // non-thenable values and other thenables gracefully.
	    var messages = [], progressListeners = [], resolvedPromise;

	    var deferred = object_create(defer.prototype);
	    var promise = object_create(Promise.prototype);

	    promise.promiseDispatch = function (resolve, op, operands) {
	        var args = array_slice(arguments);
	        if (messages) {
	            messages.push(args);
	            if (op === "when" && operands[1]) { // progress operand
	                progressListeners.push(operands[1]);
	            }
	        } else {
	            Q.nextTick(function () {
	                resolvedPromise.promiseDispatch.apply(resolvedPromise, args);
	            });
	        }
	    };

	    // XXX deprecated
	    promise.valueOf = function () {
	        if (messages) {
	            return promise;
	        }
	        var nearerValue = nearer(resolvedPromise);
	        if (isPromise(nearerValue)) {
	            resolvedPromise = nearerValue; // shorten chain
	        }
	        return nearerValue;
	    };

	    promise.inspect = function () {
	        if (!resolvedPromise) {
	            return { state: "pending" };
	        }
	        return resolvedPromise.inspect();
	    };

	    if (Q.longStackSupport && hasStacks) {
	        try {
	            throw new Error();
	        } catch (e) {
	            // NOTE: don't try to use `Error.captureStackTrace` or transfer the
	            // accessor around; that causes memory leaks as per GH-111. Just
	            // reify the stack trace as a string ASAP.
	            //
	            // At the same time, cut off the first line; it's always just
	            // "[object Promise]\n", as per the `toString`.
	            promise.stack = e.stack.substring(e.stack.indexOf("\n") + 1);
	            promise.stackCounter = longStackCounter++;
	        }
	    }

	    // NOTE: we do the checks for `resolvedPromise` in each method, instead of
	    // consolidating them into `become`, since otherwise we'd create new
	    // promises with the lines `become(whatever(value))`. See e.g. GH-252.

	    function become(newPromise) {
	        resolvedPromise = newPromise;

	        if (Q.longStackSupport && hasStacks) {
	            // Only hold a reference to the new promise if long stacks
	            // are enabled to reduce memory usage
	            promise.source = newPromise;
	        }

	        array_reduce(messages, function (undefined, message) {
	            Q.nextTick(function () {
	                newPromise.promiseDispatch.apply(newPromise, message);
	            });
	        }, void 0);

	        messages = void 0;
	        progressListeners = void 0;
	    }

	    deferred.promise = promise;
	    deferred.resolve = function (value) {
	        if (resolvedPromise) {
	            return;
	        }

	        become(Q(value));
	    };

	    deferred.fulfill = function (value) {
	        if (resolvedPromise) {
	            return;
	        }

	        become(fulfill(value));
	    };
	    deferred.reject = function (reason) {
	        if (resolvedPromise) {
	            return;
	        }

	        become(reject(reason));
	    };
	    deferred.notify = function (progress) {
	        if (resolvedPromise) {
	            return;
	        }

	        array_reduce(progressListeners, function (undefined, progressListener) {
	            Q.nextTick(function () {
	                progressListener(progress);
	            });
	        }, void 0);
	    };

	    return deferred;
	}

	/**
	 * Creates a Node-style callback that will resolve or reject the deferred
	 * promise.
	 * @returns a nodeback
	 */
	defer.prototype.makeNodeResolver = function () {
	    var self = this;
	    return function (error, value) {
	        if (error) {
	            self.reject(error);
	        } else if (arguments.length > 2) {
	            self.resolve(array_slice(arguments, 1));
	        } else {
	            self.resolve(value);
	        }
	    };
	};

	/**
	 * @param resolver {Function} a function that returns nothing and accepts
	 * the resolve, reject, and notify functions for a deferred.
	 * @returns a promise that may be resolved with the given resolve and reject
	 * functions, or rejected by a thrown exception in resolver
	 */
	Q.Promise = promise; // ES6
	Q.promise = promise;
	function promise(resolver) {
	    if (typeof resolver !== "function") {
	        throw new TypeError("resolver must be a function.");
	    }
	    var deferred = defer();
	    try {
	        resolver(deferred.resolve, deferred.reject, deferred.notify);
	    } catch (reason) {
	        deferred.reject(reason);
	    }
	    return deferred.promise;
	}

	promise.race = race; // ES6
	promise.all = all; // ES6
	promise.reject = reject; // ES6
	promise.resolve = Q; // ES6

	// XXX experimental.  This method is a way to denote that a local value is
	// serializable and should be immediately dispatched to a remote upon request,
	// instead of passing a reference.
	Q.passByCopy = function (object) {
	    //freeze(object);
	    //passByCopies.set(object, true);
	    return object;
	};

	Promise.prototype.passByCopy = function () {
	    //freeze(object);
	    //passByCopies.set(object, true);
	    return this;
	};

	/**
	 * If two promises eventually fulfill to the same value, promises that value,
	 * but otherwise rejects.
	 * @param x {Any*}
	 * @param y {Any*}
	 * @returns {Any*} a promise for x and y if they are the same, but a rejection
	 * otherwise.
	 *
	 */
	Q.join = function (x, y) {
	    return Q(x).join(y);
	};

	Promise.prototype.join = function (that) {
	    return Q([this, that]).spread(function (x, y) {
	        if (x === y) {
	            // TODO: "===" should be Object.is or equiv
	            return x;
	        } else {
	            throw new Error("Q can't join: not the same: " + x + " " + y);
	        }
	    });
	};

	/**
	 * Returns a promise for the first of an array of promises to become settled.
	 * @param answers {Array[Any*]} promises to race
	 * @returns {Any*} the first promise to be settled
	 */
	Q.race = race;
	function race(answerPs) {
	    return promise(function (resolve, reject) {
	        // Switch to this once we can assume at least ES5
	        // answerPs.forEach(function (answerP) {
	        //     Q(answerP).then(resolve, reject);
	        // });
	        // Use this in the meantime
	        for (var i = 0, len = answerPs.length; i < len; i++) {
	            Q(answerPs[i]).then(resolve, reject);
	        }
	    });
	}

	Promise.prototype.race = function () {
	    return this.then(Q.race);
	};

	/**
	 * Constructs a Promise with a promise descriptor object and optional fallback
	 * function.  The descriptor contains methods like when(rejected), get(name),
	 * set(name, value), post(name, args), and delete(name), which all
	 * return either a value, a promise for a value, or a rejection.  The fallback
	 * accepts the operation name, a resolver, and any further arguments that would
	 * have been forwarded to the appropriate method above had a method been
	 * provided with the proper name.  The API makes no guarantees about the nature
	 * of the returned object, apart from that it is usable whereever promises are
	 * bought and sold.
	 */
	Q.makePromise = Promise;
	function Promise(descriptor, fallback, inspect) {
	    if (fallback === void 0) {
	        fallback = function (op) {
	            return reject(new Error(
	                "Promise does not support operation: " + op
	            ));
	        };
	    }
	    if (inspect === void 0) {
	        inspect = function () {
	            return {state: "unknown"};
	        };
	    }

	    var promise = object_create(Promise.prototype);

	    promise.promiseDispatch = function (resolve, op, args) {
	        var result;
	        try {
	            if (descriptor[op]) {
	                result = descriptor[op].apply(promise, args);
	            } else {
	                result = fallback.call(promise, op, args);
	            }
	        } catch (exception) {
	            result = reject(exception);
	        }
	        if (resolve) {
	            resolve(result);
	        }
	    };

	    promise.inspect = inspect;

	    // XXX deprecated `valueOf` and `exception` support
	    if (inspect) {
	        var inspected = inspect();
	        if (inspected.state === "rejected") {
	            promise.exception = inspected.reason;
	        }

	        promise.valueOf = function () {
	            var inspected = inspect();
	            if (inspected.state === "pending" ||
	                inspected.state === "rejected") {
	                return promise;
	            }
	            return inspected.value;
	        };
	    }

	    return promise;
	}

	Promise.prototype.toString = function () {
	    return "[object Promise]";
	};

	Promise.prototype.then = function (fulfilled, rejected, progressed) {
	    var self = this;
	    var deferred = defer();
	    var done = false;   // ensure the untrusted promise makes at most a
	                        // single call to one of the callbacks

	    function _fulfilled(value) {
	        try {
	            return typeof fulfilled === "function" ? fulfilled(value) : value;
	        } catch (exception) {
	            return reject(exception);
	        }
	    }

	    function _rejected(exception) {
	        if (typeof rejected === "function") {
	            makeStackTraceLong(exception, self);
	            try {
	                return rejected(exception);
	            } catch (newException) {
	                return reject(newException);
	            }
	        }
	        return reject(exception);
	    }

	    function _progressed(value) {
	        return typeof progressed === "function" ? progressed(value) : value;
	    }

	    Q.nextTick(function () {
	        self.promiseDispatch(function (value) {
	            if (done) {
	                return;
	            }
	            done = true;

	            deferred.resolve(_fulfilled(value));
	        }, "when", [function (exception) {
	            if (done) {
	                return;
	            }
	            done = true;

	            deferred.resolve(_rejected(exception));
	        }]);
	    });

	    // Progress propagator need to be attached in the current tick.
	    self.promiseDispatch(void 0, "when", [void 0, function (value) {
	        var newValue;
	        var threw = false;
	        try {
	            newValue = _progressed(value);
	        } catch (e) {
	            threw = true;
	            if (Q.onerror) {
	                Q.onerror(e);
	            } else {
	                throw e;
	            }
	        }

	        if (!threw) {
	            deferred.notify(newValue);
	        }
	    }]);

	    return deferred.promise;
	};

	Q.tap = function (promise, callback) {
	    return Q(promise).tap(callback);
	};

	/**
	 * Works almost like "finally", but not called for rejections.
	 * Original resolution value is passed through callback unaffected.
	 * Callback may return a promise that will be awaited for.
	 * @param {Function} callback
	 * @returns {Q.Promise}
	 * @example
	 * doSomething()
	 *   .then(...)
	 *   .tap(console.log)
	 *   .then(...);
	 */
	Promise.prototype.tap = function (callback) {
	    callback = Q(callback);

	    return this.then(function (value) {
	        return callback.fcall(value).thenResolve(value);
	    });
	};

	/**
	 * Registers an observer on a promise.
	 *
	 * Guarantees:
	 *
	 * 1. that fulfilled and rejected will be called only once.
	 * 2. that either the fulfilled callback or the rejected callback will be
	 *    called, but not both.
	 * 3. that fulfilled and rejected will not be called in this turn.
	 *
	 * @param value      promise or immediate reference to observe
	 * @param fulfilled  function to be called with the fulfilled value
	 * @param rejected   function to be called with the rejection exception
	 * @param progressed function to be called on any progress notifications
	 * @return promise for the return value from the invoked callback
	 */
	Q.when = when;
	function when(value, fulfilled, rejected, progressed) {
	    return Q(value).then(fulfilled, rejected, progressed);
	}

	Promise.prototype.thenResolve = function (value) {
	    return this.then(function () { return value; });
	};

	Q.thenResolve = function (promise, value) {
	    return Q(promise).thenResolve(value);
	};

	Promise.prototype.thenReject = function (reason) {
	    return this.then(function () { throw reason; });
	};

	Q.thenReject = function (promise, reason) {
	    return Q(promise).thenReject(reason);
	};

	/**
	 * If an object is not a promise, it is as "near" as possible.
	 * If a promise is rejected, it is as "near" as possible too.
	 * If it’s a fulfilled promise, the fulfillment value is nearer.
	 * If it’s a deferred promise and the deferred has been resolved, the
	 * resolution is "nearer".
	 * @param object
	 * @returns most resolved (nearest) form of the object
	 */

	// XXX should we re-do this?
	Q.nearer = nearer;
	function nearer(value) {
	    if (isPromise(value)) {
	        var inspected = value.inspect();
	        if (inspected.state === "fulfilled") {
	            return inspected.value;
	        }
	    }
	    return value;
	}

	/**
	 * @returns whether the given object is a promise.
	 * Otherwise it is a fulfilled value.
	 */
	Q.isPromise = isPromise;
	function isPromise(object) {
	    return object instanceof Promise;
	}

	Q.isPromiseAlike = isPromiseAlike;
	function isPromiseAlike(object) {
	    return isObject(object) && typeof object.then === "function";
	}

	/**
	 * @returns whether the given object is a pending promise, meaning not
	 * fulfilled or rejected.
	 */
	Q.isPending = isPending;
	function isPending(object) {
	    return isPromise(object) && object.inspect().state === "pending";
	}

	Promise.prototype.isPending = function () {
	    return this.inspect().state === "pending";
	};

	/**
	 * @returns whether the given object is a value or fulfilled
	 * promise.
	 */
	Q.isFulfilled = isFulfilled;
	function isFulfilled(object) {
	    return !isPromise(object) || object.inspect().state === "fulfilled";
	}

	Promise.prototype.isFulfilled = function () {
	    return this.inspect().state === "fulfilled";
	};

	/**
	 * @returns whether the given object is a rejected promise.
	 */
	Q.isRejected = isRejected;
	function isRejected(object) {
	    return isPromise(object) && object.inspect().state === "rejected";
	}

	Promise.prototype.isRejected = function () {
	    return this.inspect().state === "rejected";
	};

	//// BEGIN UNHANDLED REJECTION TRACKING

	// This promise library consumes exceptions thrown in handlers so they can be
	// handled by a subsequent promise.  The exceptions get added to this array when
	// they are created, and removed when they are handled.  Note that in ES6 or
	// shimmed environments, this would naturally be a `Set`.
	var unhandledReasons = [];
	var unhandledRejections = [];
	var reportedUnhandledRejections = [];
	var trackUnhandledRejections = true;

	function resetUnhandledRejections() {
	    unhandledReasons.length = 0;
	    unhandledRejections.length = 0;

	    if (!trackUnhandledRejections) {
	        trackUnhandledRejections = true;
	    }
	}

	function trackRejection(promise, reason) {
	    if (!trackUnhandledRejections) {
	        return;
	    }
	    if (typeof process === "object" && typeof process.emit === "function") {
	        Q.nextTick.runAfter(function () {
	            if (array_indexOf(unhandledRejections, promise) !== -1) {
	                process.emit("unhandledRejection", reason, promise);
	                reportedUnhandledRejections.push(promise);
	            }
	        });
	    }

	    unhandledRejections.push(promise);
	    if (reason && typeof reason.stack !== "undefined") {
	        unhandledReasons.push(reason.stack);
	    } else {
	        unhandledReasons.push("(no stack) " + reason);
	    }
	}

	function untrackRejection(promise) {
	    if (!trackUnhandledRejections) {
	        return;
	    }

	    var at = array_indexOf(unhandledRejections, promise);
	    if (at !== -1) {
	        if (typeof process === "object" && typeof process.emit === "function") {
	            Q.nextTick.runAfter(function () {
	                var atReport = array_indexOf(reportedUnhandledRejections, promise);
	                if (atReport !== -1) {
	                    process.emit("rejectionHandled", unhandledReasons[at], promise);
	                    reportedUnhandledRejections.splice(atReport, 1);
	                }
	            });
	        }
	        unhandledRejections.splice(at, 1);
	        unhandledReasons.splice(at, 1);
	    }
	}

	Q.resetUnhandledRejections = resetUnhandledRejections;

	Q.getUnhandledReasons = function () {
	    // Make a copy so that consumers can't interfere with our internal state.
	    return unhandledReasons.slice();
	};

	Q.stopUnhandledRejectionTracking = function () {
	    resetUnhandledRejections();
	    trackUnhandledRejections = false;
	};

	resetUnhandledRejections();

	//// END UNHANDLED REJECTION TRACKING

	/**
	 * Constructs a rejected promise.
	 * @param reason value describing the failure
	 */
	Q.reject = reject;
	function reject(reason) {
	    var rejection = Promise({
	        "when": function (rejected) {
	            // note that the error has been handled
	            if (rejected) {
	                untrackRejection(this);
	            }
	            return rejected ? rejected(reason) : this;
	        }
	    }, function fallback() {
	        return this;
	    }, function inspect() {
	        return { state: "rejected", reason: reason };
	    });

	    // Note that the reason has not been handled.
	    trackRejection(rejection, reason);

	    return rejection;
	}

	/**
	 * Constructs a fulfilled promise for an immediate reference.
	 * @param value immediate reference
	 */
	Q.fulfill = fulfill;
	function fulfill(value) {
	    return Promise({
	        "when": function () {
	            return value;
	        },
	        "get": function (name) {
	            return value[name];
	        },
	        "set": function (name, rhs) {
	            value[name] = rhs;
	        },
	        "delete": function (name) {
	            delete value[name];
	        },
	        "post": function (name, args) {
	            // Mark Miller proposes that post with no name should apply a
	            // promised function.
	            if (name === null || name === void 0) {
	                return value.apply(void 0, args);
	            } else {
	                return value[name].apply(value, args);
	            }
	        },
	        "apply": function (thisp, args) {
	            return value.apply(thisp, args);
	        },
	        "keys": function () {
	            return object_keys(value);
	        }
	    }, void 0, function inspect() {
	        return { state: "fulfilled", value: value };
	    });
	}

	/**
	 * Converts thenables to Q promises.
	 * @param promise thenable promise
	 * @returns a Q promise
	 */
	function coerce(promise) {
	    var deferred = defer();
	    Q.nextTick(function () {
	        try {
	            promise.then(deferred.resolve, deferred.reject, deferred.notify);
	        } catch (exception) {
	            deferred.reject(exception);
	        }
	    });
	    return deferred.promise;
	}

	/**
	 * Annotates an object such that it will never be
	 * transferred away from this process over any promise
	 * communication channel.
	 * @param object
	 * @returns promise a wrapping of that object that
	 * additionally responds to the "isDef" message
	 * without a rejection.
	 */
	Q.master = master;
	function master(object) {
	    return Promise({
	        "isDef": function () {}
	    }, function fallback(op, args) {
	        return dispatch(object, op, args);
	    }, function () {
	        return Q(object).inspect();
	    });
	}

	/**
	 * Spreads the values of a promised array of arguments into the
	 * fulfillment callback.
	 * @param fulfilled callback that receives variadic arguments from the
	 * promised array
	 * @param rejected callback that receives the exception if the promise
	 * is rejected.
	 * @returns a promise for the return value or thrown exception of
	 * either callback.
	 */
	Q.spread = spread;
	function spread(value, fulfilled, rejected) {
	    return Q(value).spread(fulfilled, rejected);
	}

	Promise.prototype.spread = function (fulfilled, rejected) {
	    return this.all().then(function (array) {
	        return fulfilled.apply(void 0, array);
	    }, rejected);
	};

	/**
	 * The async function is a decorator for generator functions, turning
	 * them into asynchronous generators.  Although generators are only part
	 * of the newest ECMAScript 6 drafts, this code does not cause syntax
	 * errors in older engines.  This code should continue to work and will
	 * in fact improve over time as the language improves.
	 *
	 * ES6 generators are currently part of V8 version 3.19 with the
	 * --harmony-generators runtime flag enabled.  SpiderMonkey has had them
	 * for longer, but under an older Python-inspired form.  This function
	 * works on both kinds of generators.
	 *
	 * Decorates a generator function such that:
	 *  - it may yield promises
	 *  - execution will continue when that promise is fulfilled
	 *  - the value of the yield expression will be the fulfilled value
	 *  - it returns a promise for the return value (when the generator
	 *    stops iterating)
	 *  - the decorated function returns a promise for the return value
	 *    of the generator or the first rejected promise among those
	 *    yielded.
	 *  - if an error is thrown in the generator, it propagates through
	 *    every following yield until it is caught, or until it escapes
	 *    the generator function altogether, and is translated into a
	 *    rejection for the promise returned by the decorated generator.
	 */
	Q.async = async;
	function async(makeGenerator) {
	    return function () {
	        // when verb is "send", arg is a value
	        // when verb is "throw", arg is an exception
	        function continuer(verb, arg) {
	            var result;

	            // Until V8 3.19 / Chromium 29 is released, SpiderMonkey is the only
	            // engine that has a deployed base of browsers that support generators.
	            // However, SM's generators use the Python-inspired semantics of
	            // outdated ES6 drafts.  We would like to support ES6, but we'd also
	            // like to make it possible to use generators in deployed browsers, so
	            // we also support Python-style generators.  At some point we can remove
	            // this block.

	            if (typeof StopIteration === "undefined") {
	                // ES6 Generators
	                try {
	                    result = generator[verb](arg);
	                } catch (exception) {
	                    return reject(exception);
	                }
	                if (result.done) {
	                    return Q(result.value);
	                } else {
	                    return when(result.value, callback, errback);
	                }
	            } else {
	                // SpiderMonkey Generators
	                // FIXME: Remove this case when SM does ES6 generators.
	                try {
	                    result = generator[verb](arg);
	                } catch (exception) {
	                    if (isStopIteration(exception)) {
	                        return Q(exception.value);
	                    } else {
	                        return reject(exception);
	                    }
	                }
	                return when(result, callback, errback);
	            }
	        }
	        var generator = makeGenerator.apply(this, arguments);
	        var callback = continuer.bind(continuer, "next");
	        var errback = continuer.bind(continuer, "throw");
	        return callback();
	    };
	}

	/**
	 * The spawn function is a small wrapper around async that immediately
	 * calls the generator and also ends the promise chain, so that any
	 * unhandled errors are thrown instead of forwarded to the error
	 * handler. This is useful because it's extremely common to run
	 * generators at the top-level to work with libraries.
	 */
	Q.spawn = spawn;
	function spawn(makeGenerator) {
	    Q.done(Q.async(makeGenerator)());
	}

	// FIXME: Remove this interface once ES6 generators are in SpiderMonkey.
	/**
	 * Throws a ReturnValue exception to stop an asynchronous generator.
	 *
	 * This interface is a stop-gap measure to support generator return
	 * values in older Firefox/SpiderMonkey.  In browsers that support ES6
	 * generators like Chromium 29, just use "return" in your generator
	 * functions.
	 *
	 * @param value the return value for the surrounding generator
	 * @throws ReturnValue exception with the value.
	 * @example
	 * // ES6 style
	 * Q.async(function* () {
	 *      var foo = yield getFooPromise();
	 *      var bar = yield getBarPromise();
	 *      return foo + bar;
	 * })
	 * // Older SpiderMonkey style
	 * Q.async(function () {
	 *      var foo = yield getFooPromise();
	 *      var bar = yield getBarPromise();
	 *      Q.return(foo + bar);
	 * })
	 */
	Q["return"] = _return;
	function _return(value) {
	    throw new QReturnValue(value);
	}

	/**
	 * The promised function decorator ensures that any promise arguments
	 * are settled and passed as values (`this` is also settled and passed
	 * as a value).  It will also ensure that the result of a function is
	 * always a promise.
	 *
	 * @example
	 * var add = Q.promised(function (a, b) {
	 *     return a + b;
	 * });
	 * add(Q(a), Q(B));
	 *
	 * @param {function} callback The function to decorate
	 * @returns {function} a function that has been decorated.
	 */
	Q.promised = promised;
	function promised(callback) {
	    return function () {
	        return spread([this, all(arguments)], function (self, args) {
	            return callback.apply(self, args);
	        });
	    };
	}

	/**
	 * sends a message to a value in a future turn
	 * @param object* the recipient
	 * @param op the name of the message operation, e.g., "when",
	 * @param args further arguments to be forwarded to the operation
	 * @returns result {Promise} a promise for the result of the operation
	 */
	Q.dispatch = dispatch;
	function dispatch(object, op, args) {
	    return Q(object).dispatch(op, args);
	}

	Promise.prototype.dispatch = function (op, args) {
	    var self = this;
	    var deferred = defer();
	    Q.nextTick(function () {
	        self.promiseDispatch(deferred.resolve, op, args);
	    });
	    return deferred.promise;
	};

	/**
	 * Gets the value of a property in a future turn.
	 * @param object    promise or immediate reference for target object
	 * @param name      name of property to get
	 * @return promise for the property value
	 */
	Q.get = function (object, key) {
	    return Q(object).dispatch("get", [key]);
	};

	Promise.prototype.get = function (key) {
	    return this.dispatch("get", [key]);
	};

	/**
	 * Sets the value of a property in a future turn.
	 * @param object    promise or immediate reference for object object
	 * @param name      name of property to set
	 * @param value     new value of property
	 * @return promise for the return value
	 */
	Q.set = function (object, key, value) {
	    return Q(object).dispatch("set", [key, value]);
	};

	Promise.prototype.set = function (key, value) {
	    return this.dispatch("set", [key, value]);
	};

	/**
	 * Deletes a property in a future turn.
	 * @param object    promise or immediate reference for target object
	 * @param name      name of property to delete
	 * @return promise for the return value
	 */
	Q.del = // XXX legacy
	Q["delete"] = function (object, key) {
	    return Q(object).dispatch("delete", [key]);
	};

	Promise.prototype.del = // XXX legacy
	Promise.prototype["delete"] = function (key) {
	    return this.dispatch("delete", [key]);
	};

	/**
	 * Invokes a method in a future turn.
	 * @param object    promise or immediate reference for target object
	 * @param name      name of method to invoke
	 * @param value     a value to post, typically an array of
	 *                  invocation arguments for promises that
	 *                  are ultimately backed with `resolve` values,
	 *                  as opposed to those backed with URLs
	 *                  wherein the posted value can be any
	 *                  JSON serializable object.
	 * @return promise for the return value
	 */
	// bound locally because it is used by other methods
	Q.mapply = // XXX As proposed by "Redsandro"
	Q.post = function (object, name, args) {
	    return Q(object).dispatch("post", [name, args]);
	};

	Promise.prototype.mapply = // XXX As proposed by "Redsandro"
	Promise.prototype.post = function (name, args) {
	    return this.dispatch("post", [name, args]);
	};

	/**
	 * Invokes a method in a future turn.
	 * @param object    promise or immediate reference for target object
	 * @param name      name of method to invoke
	 * @param ...args   array of invocation arguments
	 * @return promise for the return value
	 */
	Q.send = // XXX Mark Miller's proposed parlance
	Q.mcall = // XXX As proposed by "Redsandro"
	Q.invoke = function (object, name /*...args*/) {
	    return Q(object).dispatch("post", [name, array_slice(arguments, 2)]);
	};

	Promise.prototype.send = // XXX Mark Miller's proposed parlance
	Promise.prototype.mcall = // XXX As proposed by "Redsandro"
	Promise.prototype.invoke = function (name /*...args*/) {
	    return this.dispatch("post", [name, array_slice(arguments, 1)]);
	};

	/**
	 * Applies the promised function in a future turn.
	 * @param object    promise or immediate reference for target function
	 * @param args      array of application arguments
	 */
	Q.fapply = function (object, args) {
	    return Q(object).dispatch("apply", [void 0, args]);
	};

	Promise.prototype.fapply = function (args) {
	    return this.dispatch("apply", [void 0, args]);
	};

	/**
	 * Calls the promised function in a future turn.
	 * @param object    promise or immediate reference for target function
	 * @param ...args   array of application arguments
	 */
	Q["try"] =
	Q.fcall = function (object /* ...args*/) {
	    return Q(object).dispatch("apply", [void 0, array_slice(arguments, 1)]);
	};

	Promise.prototype.fcall = function (/*...args*/) {
	    return this.dispatch("apply", [void 0, array_slice(arguments)]);
	};

	/**
	 * Binds the promised function, transforming return values into a fulfilled
	 * promise and thrown errors into a rejected one.
	 * @param object    promise or immediate reference for target function
	 * @param ...args   array of application arguments
	 */
	Q.fbind = function (object /*...args*/) {
	    var promise = Q(object);
	    var args = array_slice(arguments, 1);
	    return function fbound() {
	        return promise.dispatch("apply", [
	            this,
	            args.concat(array_slice(arguments))
	        ]);
	    };
	};
	Promise.prototype.fbind = function (/*...args*/) {
	    var promise = this;
	    var args = array_slice(arguments);
	    return function fbound() {
	        return promise.dispatch("apply", [
	            this,
	            args.concat(array_slice(arguments))
	        ]);
	    };
	};

	/**
	 * Requests the names of the owned properties of a promised
	 * object in a future turn.
	 * @param object    promise or immediate reference for target object
	 * @return promise for the keys of the eventually settled object
	 */
	Q.keys = function (object) {
	    return Q(object).dispatch("keys", []);
	};

	Promise.prototype.keys = function () {
	    return this.dispatch("keys", []);
	};

	/**
	 * Turns an array of promises into a promise for an array.  If any of
	 * the promises gets rejected, the whole array is rejected immediately.
	 * @param {Array*} an array (or promise for an array) of values (or
	 * promises for values)
	 * @returns a promise for an array of the corresponding values
	 */
	// By Mark Miller
	// http://wiki.ecmascript.org/doku.php?id=strawman:concurrency&rev=1308776521#allfulfilled
	Q.all = all;
	function all(promises) {
	    return when(promises, function (promises) {
	        var pendingCount = 0;
	        var deferred = defer();
	        array_reduce(promises, function (undefined, promise, index) {
	            var snapshot;
	            if (
	                isPromise(promise) &&
	                (snapshot = promise.inspect()).state === "fulfilled"
	            ) {
	                promises[index] = snapshot.value;
	            } else {
	                ++pendingCount;
	                when(
	                    promise,
	                    function (value) {
	                        promises[index] = value;
	                        if (--pendingCount === 0) {
	                            deferred.resolve(promises);
	                        }
	                    },
	                    deferred.reject,
	                    function (progress) {
	                        deferred.notify({ index: index, value: progress });
	                    }
	                );
	            }
	        }, void 0);
	        if (pendingCount === 0) {
	            deferred.resolve(promises);
	        }
	        return deferred.promise;
	    });
	}

	Promise.prototype.all = function () {
	    return all(this);
	};

	/**
	 * Returns the first resolved promise of an array. Prior rejected promises are
	 * ignored.  Rejects only if all promises are rejected.
	 * @param {Array*} an array containing values or promises for values
	 * @returns a promise fulfilled with the value of the first resolved promise,
	 * or a rejected promise if all promises are rejected.
	 */
	Q.any = any;

	function any(promises) {
	    if (promises.length === 0) {
	        return Q.resolve();
	    }

	    var deferred = Q.defer();
	    var pendingCount = 0;
	    array_reduce(promises, function (prev, current, index) {
	        var promise = promises[index];

	        pendingCount++;

	        when(promise, onFulfilled, onRejected, onProgress);
	        function onFulfilled(result) {
	            deferred.resolve(result);
	        }
	        function onRejected(err) {
	            pendingCount--;
	            if (pendingCount === 0) {
	                var rejection = err || new Error("" + err);

	                rejection.message = ("Q can't get fulfillment value from any promise, all " +
	                    "promises were rejected. Last error message: " + rejection.message);

	                deferred.reject(rejection);
	            }
	        }
	        function onProgress(progress) {
	            deferred.notify({
	                index: index,
	                value: progress
	            });
	        }
	    }, undefined);

	    return deferred.promise;
	}

	Promise.prototype.any = function () {
	    return any(this);
	};

	/**
	 * Waits for all promises to be settled, either fulfilled or
	 * rejected.  This is distinct from `all` since that would stop
	 * waiting at the first rejection.  The promise returned by
	 * `allResolved` will never be rejected.
	 * @param promises a promise for an array (or an array) of promises
	 * (or values)
	 * @return a promise for an array of promises
	 */
	Q.allResolved = deprecate(allResolved, "allResolved", "allSettled");
	function allResolved(promises) {
	    return when(promises, function (promises) {
	        promises = array_map(promises, Q);
	        return when(all(array_map(promises, function (promise) {
	            return when(promise, noop, noop);
	        })), function () {
	            return promises;
	        });
	    });
	}

	Promise.prototype.allResolved = function () {
	    return allResolved(this);
	};

	/**
	 * @see Promise#allSettled
	 */
	Q.allSettled = allSettled;
	function allSettled(promises) {
	    return Q(promises).allSettled();
	}

	/**
	 * Turns an array of promises into a promise for an array of their states (as
	 * returned by `inspect`) when they have all settled.
	 * @param {Array[Any*]} values an array (or promise for an array) of values (or
	 * promises for values)
	 * @returns {Array[State]} an array of states for the respective values.
	 */
	Promise.prototype.allSettled = function () {
	    return this.then(function (promises) {
	        return all(array_map(promises, function (promise) {
	            promise = Q(promise);
	            function regardless() {
	                return promise.inspect();
	            }
	            return promise.then(regardless, regardless);
	        }));
	    });
	};

	/**
	 * Captures the failure of a promise, giving an oportunity to recover
	 * with a callback.  If the given promise is fulfilled, the returned
	 * promise is fulfilled.
	 * @param {Any*} promise for something
	 * @param {Function} callback to fulfill the returned promise if the
	 * given promise is rejected
	 * @returns a promise for the return value of the callback
	 */
	Q.fail = // XXX legacy
	Q["catch"] = function (object, rejected) {
	    return Q(object).then(void 0, rejected);
	};

	Promise.prototype.fail = // XXX legacy
	Promise.prototype["catch"] = function (rejected) {
	    return this.then(void 0, rejected);
	};

	/**
	 * Attaches a listener that can respond to progress notifications from a
	 * promise's originating deferred. This listener receives the exact arguments
	 * passed to ``deferred.notify``.
	 * @param {Any*} promise for something
	 * @param {Function} callback to receive any progress notifications
	 * @returns the given promise, unchanged
	 */
	Q.progress = progress;
	function progress(object, progressed) {
	    return Q(object).then(void 0, void 0, progressed);
	}

	Promise.prototype.progress = function (progressed) {
	    return this.then(void 0, void 0, progressed);
	};

	/**
	 * Provides an opportunity to observe the settling of a promise,
	 * regardless of whether the promise is fulfilled or rejected.  Forwards
	 * the resolution to the returned promise when the callback is done.
	 * The callback can return a promise to defer completion.
	 * @param {Any*} promise
	 * @param {Function} callback to observe the resolution of the given
	 * promise, takes no arguments.
	 * @returns a promise for the resolution of the given promise when
	 * ``fin`` is done.
	 */
	Q.fin = // XXX legacy
	Q["finally"] = function (object, callback) {
	    return Q(object)["finally"](callback);
	};

	Promise.prototype.fin = // XXX legacy
	Promise.prototype["finally"] = function (callback) {
	    if (!callback || typeof callback.apply !== "function") {
	        throw new Error("Q can't apply finally callback");
	    }
	    callback = Q(callback);
	    return this.then(function (value) {
	        return callback.fcall().then(function () {
	            return value;
	        });
	    }, function (reason) {
	        // TODO attempt to recycle the rejection with "this".
	        return callback.fcall().then(function () {
	            throw reason;
	        });
	    });
	};

	/**
	 * Terminates a chain of promises, forcing rejections to be
	 * thrown as exceptions.
	 * @param {Any*} promise at the end of a chain of promises
	 * @returns nothing
	 */
	Q.done = function (object, fulfilled, rejected, progress) {
	    return Q(object).done(fulfilled, rejected, progress);
	};

	Promise.prototype.done = function (fulfilled, rejected, progress) {
	    var onUnhandledError = function (error) {
	        // forward to a future turn so that ``when``
	        // does not catch it and turn it into a rejection.
	        Q.nextTick(function () {
	            makeStackTraceLong(error, promise);
	            if (Q.onerror) {
	                Q.onerror(error);
	            } else {
	                throw error;
	            }
	        });
	    };

	    // Avoid unnecessary `nextTick`ing via an unnecessary `when`.
	    var promise = fulfilled || rejected || progress ?
	        this.then(fulfilled, rejected, progress) :
	        this;

	    if (typeof process === "object" && process && process.domain) {
	        onUnhandledError = process.domain.bind(onUnhandledError);
	    }

	    promise.then(void 0, onUnhandledError);
	};

	/**
	 * Causes a promise to be rejected if it does not get fulfilled before
	 * some milliseconds time out.
	 * @param {Any*} promise
	 * @param {Number} milliseconds timeout
	 * @param {Any*} custom error message or Error object (optional)
	 * @returns a promise for the resolution of the given promise if it is
	 * fulfilled before the timeout, otherwise rejected.
	 */
	Q.timeout = function (object, ms, error) {
	    return Q(object).timeout(ms, error);
	};

	Promise.prototype.timeout = function (ms, error) {
	    var deferred = defer();
	    var timeoutId = setTimeout(function () {
	        if (!error || "string" === typeof error) {
	            error = new Error(error || "Timed out after " + ms + " ms");
	            error.code = "ETIMEDOUT";
	        }
	        deferred.reject(error);
	    }, ms);

	    this.then(function (value) {
	        clearTimeout(timeoutId);
	        deferred.resolve(value);
	    }, function (exception) {
	        clearTimeout(timeoutId);
	        deferred.reject(exception);
	    }, deferred.notify);

	    return deferred.promise;
	};

	/**
	 * Returns a promise for the given value (or promised value), some
	 * milliseconds after it resolved. Passes rejections immediately.
	 * @param {Any*} promise
	 * @param {Number} milliseconds
	 * @returns a promise for the resolution of the given promise after milliseconds
	 * time has elapsed since the resolution of the given promise.
	 * If the given promise rejects, that is passed immediately.
	 */
	Q.delay = function (object, timeout) {
	    if (timeout === void 0) {
	        timeout = object;
	        object = void 0;
	    }
	    return Q(object).delay(timeout);
	};

	Promise.prototype.delay = function (timeout) {
	    return this.then(function (value) {
	        var deferred = defer();
	        setTimeout(function () {
	            deferred.resolve(value);
	        }, timeout);
	        return deferred.promise;
	    });
	};

	/**
	 * Passes a continuation to a Node function, which is called with the given
	 * arguments provided as an array, and returns a promise.
	 *
	 *      Q.nfapply(FS.readFile, [__filename])
	 *      .then(function (content) {
	 *      })
	 *
	 */
	Q.nfapply = function (callback, args) {
	    return Q(callback).nfapply(args);
	};

	Promise.prototype.nfapply = function (args) {
	    var deferred = defer();
	    var nodeArgs = array_slice(args);
	    nodeArgs.push(deferred.makeNodeResolver());
	    this.fapply(nodeArgs).fail(deferred.reject);
	    return deferred.promise;
	};

	/**
	 * Passes a continuation to a Node function, which is called with the given
	 * arguments provided individually, and returns a promise.
	 * @example
	 * Q.nfcall(FS.readFile, __filename)
	 * .then(function (content) {
	 * })
	 *
	 */
	Q.nfcall = function (callback /*...args*/) {
	    var args = array_slice(arguments, 1);
	    return Q(callback).nfapply(args);
	};

	Promise.prototype.nfcall = function (/*...args*/) {
	    var nodeArgs = array_slice(arguments);
	    var deferred = defer();
	    nodeArgs.push(deferred.makeNodeResolver());
	    this.fapply(nodeArgs).fail(deferred.reject);
	    return deferred.promise;
	};

	/**
	 * Wraps a NodeJS continuation passing function and returns an equivalent
	 * version that returns a promise.
	 * @example
	 * Q.nfbind(FS.readFile, __filename)("utf-8")
	 * .then(console.log)
	 * .done()
	 */
	Q.nfbind =
	Q.denodeify = function (callback /*...args*/) {
	    if (callback === undefined) {
	        throw new Error("Q can't wrap an undefined function");
	    }
	    var baseArgs = array_slice(arguments, 1);
	    return function () {
	        var nodeArgs = baseArgs.concat(array_slice(arguments));
	        var deferred = defer();
	        nodeArgs.push(deferred.makeNodeResolver());
	        Q(callback).fapply(nodeArgs).fail(deferred.reject);
	        return deferred.promise;
	    };
	};

	Promise.prototype.nfbind =
	Promise.prototype.denodeify = function (/*...args*/) {
	    var args = array_slice(arguments);
	    args.unshift(this);
	    return Q.denodeify.apply(void 0, args);
	};

	Q.nbind = function (callback, thisp /*...args*/) {
	    var baseArgs = array_slice(arguments, 2);
	    return function () {
	        var nodeArgs = baseArgs.concat(array_slice(arguments));
	        var deferred = defer();
	        nodeArgs.push(deferred.makeNodeResolver());
	        function bound() {
	            return callback.apply(thisp, arguments);
	        }
	        Q(bound).fapply(nodeArgs).fail(deferred.reject);
	        return deferred.promise;
	    };
	};

	Promise.prototype.nbind = function (/*thisp, ...args*/) {
	    var args = array_slice(arguments, 0);
	    args.unshift(this);
	    return Q.nbind.apply(void 0, args);
	};

	/**
	 * Calls a method of a Node-style object that accepts a Node-style
	 * callback with a given array of arguments, plus a provided callback.
	 * @param object an object that has the named method
	 * @param {String} name name of the method of object
	 * @param {Array} args arguments to pass to the method; the callback
	 * will be provided by Q and appended to these arguments.
	 * @returns a promise for the value or error
	 */
	Q.nmapply = // XXX As proposed by "Redsandro"
	Q.npost = function (object, name, args) {
	    return Q(object).npost(name, args);
	};

	Promise.prototype.nmapply = // XXX As proposed by "Redsandro"
	Promise.prototype.npost = function (name, args) {
	    var nodeArgs = array_slice(args || []);
	    var deferred = defer();
	    nodeArgs.push(deferred.makeNodeResolver());
	    this.dispatch("post", [name, nodeArgs]).fail(deferred.reject);
	    return deferred.promise;
	};

	/**
	 * Calls a method of a Node-style object that accepts a Node-style
	 * callback, forwarding the given variadic arguments, plus a provided
	 * callback argument.
	 * @param object an object that has the named method
	 * @param {String} name name of the method of object
	 * @param ...args arguments to pass to the method; the callback will
	 * be provided by Q and appended to these arguments.
	 * @returns a promise for the value or error
	 */
	Q.nsend = // XXX Based on Mark Miller's proposed "send"
	Q.nmcall = // XXX Based on "Redsandro's" proposal
	Q.ninvoke = function (object, name /*...args*/) {
	    var nodeArgs = array_slice(arguments, 2);
	    var deferred = defer();
	    nodeArgs.push(deferred.makeNodeResolver());
	    Q(object).dispatch("post", [name, nodeArgs]).fail(deferred.reject);
	    return deferred.promise;
	};

	Promise.prototype.nsend = // XXX Based on Mark Miller's proposed "send"
	Promise.prototype.nmcall = // XXX Based on "Redsandro's" proposal
	Promise.prototype.ninvoke = function (name /*...args*/) {
	    var nodeArgs = array_slice(arguments, 1);
	    var deferred = defer();
	    nodeArgs.push(deferred.makeNodeResolver());
	    this.dispatch("post", [name, nodeArgs]).fail(deferred.reject);
	    return deferred.promise;
	};

	/**
	 * If a function would like to support both Node continuation-passing-style and
	 * promise-returning-style, it can end its internal promise chain with
	 * `nodeify(nodeback)`, forwarding the optional nodeback argument.  If the user
	 * elects to use a nodeback, the result will be sent there.  If they do not
	 * pass a nodeback, they will receive the result promise.
	 * @param object a result (or a promise for a result)
	 * @param {Function} nodeback a Node.js-style callback
	 * @returns either the promise or nothing
	 */
	Q.nodeify = nodeify;
	function nodeify(object, nodeback) {
	    return Q(object).nodeify(nodeback);
	}

	Promise.prototype.nodeify = function (nodeback) {
	    if (nodeback) {
	        this.then(function (value) {
	            Q.nextTick(function () {
	                nodeback(null, value);
	            });
	        }, function (error) {
	            Q.nextTick(function () {
	                nodeback(error);
	            });
	        });
	    } else {
	        return this;
	    }
	};

	Q.noConflict = function() {
	    throw new Error("Q.noConflict only works when Q is used as a global");
	};

	// All code before this point will be filtered from stack traces.
	var qEndingLine = captureLine();

	return Q;

	});

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(22), __webpack_require__(23).setImmediate))

/***/ }),
/* 22 */
/***/ (function(module, exports) {

	// shim for using process in browser
	var process = module.exports = {};

	// cached from whatever global is present so that test runners that stub it
	// don't break things.  But we need to wrap it in a try catch in case it is
	// wrapped in strict mode code which doesn't define any globals.  It's inside a
	// function because try/catches deoptimize in certain engines.

	var cachedSetTimeout;
	var cachedClearTimeout;

	function defaultSetTimout() {
	    throw new Error('setTimeout has not been defined');
	}
	function defaultClearTimeout () {
	    throw new Error('clearTimeout has not been defined');
	}
	(function () {
	    try {
	        if (typeof setTimeout === 'function') {
	            cachedSetTimeout = setTimeout;
	        } else {
	            cachedSetTimeout = defaultSetTimout;
	        }
	    } catch (e) {
	        cachedSetTimeout = defaultSetTimout;
	    }
	    try {
	        if (typeof clearTimeout === 'function') {
	            cachedClearTimeout = clearTimeout;
	        } else {
	            cachedClearTimeout = defaultClearTimeout;
	        }
	    } catch (e) {
	        cachedClearTimeout = defaultClearTimeout;
	    }
	} ())
	function runTimeout(fun) {
	    if (cachedSetTimeout === setTimeout) {
	        //normal enviroments in sane situations
	        return setTimeout(fun, 0);
	    }
	    // if setTimeout wasn't available but was latter defined
	    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
	        cachedSetTimeout = setTimeout;
	        return setTimeout(fun, 0);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedSetTimeout(fun, 0);
	    } catch(e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
	            return cachedSetTimeout.call(null, fun, 0);
	        } catch(e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
	            return cachedSetTimeout.call(this, fun, 0);
	        }
	    }


	}
	function runClearTimeout(marker) {
	    if (cachedClearTimeout === clearTimeout) {
	        //normal enviroments in sane situations
	        return clearTimeout(marker);
	    }
	    // if clearTimeout wasn't available but was latter defined
	    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
	        cachedClearTimeout = clearTimeout;
	        return clearTimeout(marker);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedClearTimeout(marker);
	    } catch (e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
	            return cachedClearTimeout.call(null, marker);
	        } catch (e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
	            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
	            return cachedClearTimeout.call(this, marker);
	        }
	    }



	}
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;

	function cleanUpNextTick() {
	    if (!draining || !currentQueue) {
	        return;
	    }
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}

	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = runTimeout(cleanUpNextTick);
	    draining = true;

	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    runClearTimeout(timeout);
	}

	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        runTimeout(drainQueue);
	    }
	};

	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};

	function noop() {}

	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;
	process.prependListener = noop;
	process.prependOnceListener = noop;

	process.listeners = function (name) { return [] }

	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};

	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {var scope = (typeof global !== "undefined" && global) ||
	            (typeof self !== "undefined" && self) ||
	            window;
	var apply = Function.prototype.apply;

	// DOM APIs, for completeness

	exports.setTimeout = function() {
	  return new Timeout(apply.call(setTimeout, scope, arguments), clearTimeout);
	};
	exports.setInterval = function() {
	  return new Timeout(apply.call(setInterval, scope, arguments), clearInterval);
	};
	exports.clearTimeout =
	exports.clearInterval = function(timeout) {
	  if (timeout) {
	    timeout.close();
	  }
	};

	function Timeout(id, clearFn) {
	  this._id = id;
	  this._clearFn = clearFn;
	}
	Timeout.prototype.unref = Timeout.prototype.ref = function() {};
	Timeout.prototype.close = function() {
	  this._clearFn.call(scope, this._id);
	};

	// Does not start the time, just sets up the members needed.
	exports.enroll = function(item, msecs) {
	  clearTimeout(item._idleTimeoutId);
	  item._idleTimeout = msecs;
	};

	exports.unenroll = function(item) {
	  clearTimeout(item._idleTimeoutId);
	  item._idleTimeout = -1;
	};

	exports._unrefActive = exports.active = function(item) {
	  clearTimeout(item._idleTimeoutId);

	  var msecs = item._idleTimeout;
	  if (msecs >= 0) {
	    item._idleTimeoutId = setTimeout(function onTimeout() {
	      if (item._onTimeout)
	        item._onTimeout();
	    }, msecs);
	  }
	};

	// setimmediate attaches itself to the global object
	__webpack_require__(24);
	// On some exotic environments, it's not clear which object `setimmediate` was
	// able to install onto.  Search each possibility in the same order as the
	// `setimmediate` library.
	exports.setImmediate = (typeof self !== "undefined" && self.setImmediate) ||
	                       (typeof global !== "undefined" && global.setImmediate) ||
	                       (this && this.setImmediate);
	exports.clearImmediate = (typeof self !== "undefined" && self.clearImmediate) ||
	                         (typeof global !== "undefined" && global.clearImmediate) ||
	                         (this && this.clearImmediate);

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global, process) {(function (global, undefined) {
	    "use strict";

	    if (global.setImmediate) {
	        return;
	    }

	    var nextHandle = 1; // Spec says greater than zero
	    var tasksByHandle = {};
	    var currentlyRunningATask = false;
	    var doc = global.document;
	    var registerImmediate;

	    function setImmediate(callback) {
	      // Callback can either be a function or a string
	      if (typeof callback !== "function") {
	        callback = new Function("" + callback);
	      }
	      // Copy function arguments
	      var args = new Array(arguments.length - 1);
	      for (var i = 0; i < args.length; i++) {
	          args[i] = arguments[i + 1];
	      }
	      // Store and register the task
	      var task = { callback: callback, args: args };
	      tasksByHandle[nextHandle] = task;
	      registerImmediate(nextHandle);
	      return nextHandle++;
	    }

	    function clearImmediate(handle) {
	        delete tasksByHandle[handle];
	    }

	    function run(task) {
	        var callback = task.callback;
	        var args = task.args;
	        switch (args.length) {
	        case 0:
	            callback();
	            break;
	        case 1:
	            callback(args[0]);
	            break;
	        case 2:
	            callback(args[0], args[1]);
	            break;
	        case 3:
	            callback(args[0], args[1], args[2]);
	            break;
	        default:
	            callback.apply(undefined, args);
	            break;
	        }
	    }

	    function runIfPresent(handle) {
	        // From the spec: "Wait until any invocations of this algorithm started before this one have completed."
	        // So if we're currently running a task, we'll need to delay this invocation.
	        if (currentlyRunningATask) {
	            // Delay by doing a setTimeout. setImmediate was tried instead, but in Firefox 7 it generated a
	            // "too much recursion" error.
	            setTimeout(runIfPresent, 0, handle);
	        } else {
	            var task = tasksByHandle[handle];
	            if (task) {
	                currentlyRunningATask = true;
	                try {
	                    run(task);
	                } finally {
	                    clearImmediate(handle);
	                    currentlyRunningATask = false;
	                }
	            }
	        }
	    }

	    function installNextTickImplementation() {
	        registerImmediate = function(handle) {
	            process.nextTick(function () { runIfPresent(handle); });
	        };
	    }

	    function canUsePostMessage() {
	        // The test against `importScripts` prevents this implementation from being installed inside a web worker,
	        // where `global.postMessage` means something completely different and can't be used for this purpose.
	        if (global.postMessage && !global.importScripts) {
	            var postMessageIsAsynchronous = true;
	            var oldOnMessage = global.onmessage;
	            global.onmessage = function() {
	                postMessageIsAsynchronous = false;
	            };
	            global.postMessage("", "*");
	            global.onmessage = oldOnMessage;
	            return postMessageIsAsynchronous;
	        }
	    }

	    function installPostMessageImplementation() {
	        // Installs an event handler on `global` for the `message` event: see
	        // * https://developer.mozilla.org/en/DOM/window.postMessage
	        // * http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html#crossDocumentMessages

	        var messagePrefix = "setImmediate$" + Math.random() + "$";
	        var onGlobalMessage = function(event) {
	            if (event.source === global &&
	                typeof event.data === "string" &&
	                event.data.indexOf(messagePrefix) === 0) {
	                runIfPresent(+event.data.slice(messagePrefix.length));
	            }
	        };

	        if (global.addEventListener) {
	            global.addEventListener("message", onGlobalMessage, false);
	        } else {
	            global.attachEvent("onmessage", onGlobalMessage);
	        }

	        registerImmediate = function(handle) {
	            global.postMessage(messagePrefix + handle, "*");
	        };
	    }

	    function installMessageChannelImplementation() {
	        var channel = new MessageChannel();
	        channel.port1.onmessage = function(event) {
	            var handle = event.data;
	            runIfPresent(handle);
	        };

	        registerImmediate = function(handle) {
	            channel.port2.postMessage(handle);
	        };
	    }

	    function installReadyStateChangeImplementation() {
	        var html = doc.documentElement;
	        registerImmediate = function(handle) {
	            // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
	            // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
	            var script = doc.createElement("script");
	            script.onreadystatechange = function () {
	                runIfPresent(handle);
	                script.onreadystatechange = null;
	                html.removeChild(script);
	                script = null;
	            };
	            html.appendChild(script);
	        };
	    }

	    function installSetTimeoutImplementation() {
	        registerImmediate = function(handle) {
	            setTimeout(runIfPresent, 0, handle);
	        };
	    }

	    // If supported, we should attach to the prototype of global, since that is where setTimeout et al. live.
	    var attachTo = Object.getPrototypeOf && Object.getPrototypeOf(global);
	    attachTo = attachTo && attachTo.setTimeout ? attachTo : global;

	    // Don't get fooled by e.g. browserify environments.
	    if ({}.toString.call(global.process) === "[object process]") {
	        // For Node.js before 0.9
	        installNextTickImplementation();

	    } else if (canUsePostMessage()) {
	        // For non-IE10 modern browsers
	        installPostMessageImplementation();

	    } else if (global.MessageChannel) {
	        // For web workers, where supported
	        installMessageChannelImplementation();

	    } else if (doc && "onreadystatechange" in doc.createElement("script")) {
	        // For IE 6–8
	        installReadyStateChangeImplementation();

	    } else {
	        // For older browsers
	        installSetTimeoutImplementation();
	    }

	    attachTo.setImmediate = setImmediate;
	    attachTo.clearImmediate = clearImmediate;
	}(typeof self === "undefined" ? typeof global === "undefined" ? this : global : self));

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(22)))

/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

	/*
	 * Hamster.js v1.1.2
	 * (c) 2013 Monospaced http://monospaced.com
	 * License: MIT
	 */

	(function(window, document){
	'use strict';

	/**
	 * Hamster
	 * use this to create instances
	 * @returns {Hamster.Instance}
	 * @constructor
	 */
	var Hamster = function(element) {
	  return new Hamster.Instance(element);
	};

	// default event name
	Hamster.SUPPORT = 'wheel';

	// default DOM methods
	Hamster.ADD_EVENT = 'addEventListener';
	Hamster.REMOVE_EVENT = 'removeEventListener';
	Hamster.PREFIX = '';

	// until browser inconsistencies have been fixed...
	Hamster.READY = false;

	Hamster.Instance = function(element){
	  if (!Hamster.READY) {
	    // fix browser inconsistencies
	    Hamster.normalise.browser();

	    // Hamster is ready...!
	    Hamster.READY = true;
	  }

	  this.element = element;

	  // store attached event handlers
	  this.handlers = [];

	  // return instance
	  return this;
	};

	/**
	 * create new hamster instance
	 * all methods should return the instance itself, so it is chainable.
	 * @param   {HTMLElement}       element
	 * @returns {Hamster.Instance}
	 * @constructor
	 */
	Hamster.Instance.prototype = {
	  /**
	   * bind events to the instance
	   * @param   {Function}    handler
	   * @param   {Boolean}     useCapture
	   * @returns {Hamster.Instance}
	   */
	  wheel: function onEvent(handler, useCapture){
	    Hamster.event.add(this, Hamster.SUPPORT, handler, useCapture);

	    // handle MozMousePixelScroll in older Firefox
	    if (Hamster.SUPPORT === 'DOMMouseScroll') {
	      Hamster.event.add(this, 'MozMousePixelScroll', handler, useCapture);
	    }

	    return this;
	  },

	  /**
	   * unbind events to the instance
	   * @param   {Function}    handler
	   * @param   {Boolean}     useCapture
	   * @returns {Hamster.Instance}
	   */
	  unwheel: function offEvent(handler, useCapture){
	    // if no handler argument,
	    // unbind the last bound handler (if exists)
	    if (handler === undefined && (handler = this.handlers.slice(-1)[0])) {
	      handler = handler.original;
	    }

	    Hamster.event.remove(this, Hamster.SUPPORT, handler, useCapture);

	    // handle MozMousePixelScroll in older Firefox
	    if (Hamster.SUPPORT === 'DOMMouseScroll') {
	      Hamster.event.remove(this, 'MozMousePixelScroll', handler, useCapture);
	    }

	    return this;
	  }
	};

	Hamster.event = {
	  /**
	   * cross-browser 'addWheelListener'
	   * @param   {Instance}    hamster
	   * @param   {String}      eventName
	   * @param   {Function}    handler
	   * @param   {Boolean}     useCapture
	   */
	  add: function add(hamster, eventName, handler, useCapture){
	    // store the original handler
	    var originalHandler = handler;

	    // redefine the handler
	    handler = function(originalEvent){

	      if (!originalEvent) {
	        originalEvent = window.event;
	      }

	      // create a normalised event object,
	      // and normalise "deltas" of the mouse wheel
	      var event = Hamster.normalise.event(originalEvent),
	          delta = Hamster.normalise.delta(originalEvent);

	      // fire the original handler with normalised arguments
	      return originalHandler(event, delta[0], delta[1], delta[2]);

	    };

	    // cross-browser addEventListener
	    hamster.element[Hamster.ADD_EVENT](Hamster.PREFIX + eventName, handler, useCapture || false);

	    // store original and normalised handlers on the instance
	    hamster.handlers.push({
	      original: originalHandler,
	      normalised: handler
	    });
	  },

	  /**
	   * removeWheelListener
	   * @param   {Instance}    hamster
	   * @param   {String}      eventName
	   * @param   {Function}    handler
	   * @param   {Boolean}     useCapture
	   */
	  remove: function remove(hamster, eventName, handler, useCapture){
	    // find the normalised handler on the instance
	    var originalHandler = handler,
	        lookup = {},
	        handlers;
	    for (var i = 0, len = hamster.handlers.length; i < len; ++i) {
	      lookup[hamster.handlers[i].original] = hamster.handlers[i];
	    }
	    handlers = lookup[originalHandler];
	    handler = handlers.normalised;

	    // cross-browser removeEventListener
	    hamster.element[Hamster.REMOVE_EVENT](Hamster.PREFIX + eventName, handler, useCapture || false);

	    // remove original and normalised handlers from the instance
	    for (var h in hamster.handlers) {
	      if (hamster.handlers[h] == handlers) {
	        hamster.handlers.splice(h, 1);
	        break;
	      }
	    }
	  }
	};

	/**
	 * these hold the lowest deltas,
	 * used to normalise the delta values
	 * @type {Number}
	 */
	var lowestDelta,
	    lowestDeltaXY;

	Hamster.normalise = {
	  /**
	   * fix browser inconsistencies
	   */
	  browser: function normaliseBrowser(){
	    // detect deprecated wheel events
	    if (!('onwheel' in document || document.documentMode >= 9)) {
	      Hamster.SUPPORT = document.onmousewheel !== undefined ?
	                        'mousewheel' : // webkit and IE < 9 support at least "mousewheel"
	                        'DOMMouseScroll'; // assume remaining browsers are older Firefox
	    }

	    // detect deprecated event model
	    if (!window.addEventListener) {
	      // assume IE < 9
	      Hamster.ADD_EVENT = 'attachEvent';
	      Hamster.REMOVE_EVENT = 'detachEvent';
	      Hamster.PREFIX = 'on';
	    }

	  },

	  /**
	   * create a normalised event object
	   * @param   {Function}    originalEvent
	   * @returns {Object}      event
	   */
	   event: function normaliseEvent(originalEvent){
	    var event = {
	          // keep a reference to the original event object
	          originalEvent: originalEvent,
	          target: originalEvent.target || originalEvent.srcElement,
	          type: 'wheel',
	          deltaMode: originalEvent.type === 'MozMousePixelScroll' ? 0 : 1,
	          deltaX: 0,
	          deltaZ: 0,
	          preventDefault: function(){
	            if (originalEvent.preventDefault) {
	              originalEvent.preventDefault();
	            } else {
	              originalEvent.returnValue = false;
	            }
	          },
	          stopPropagation: function(){
	            if (originalEvent.stopPropagation) {
	              originalEvent.stopPropagation();
	            } else {
	              originalEvent.cancelBubble = false;
	            }
	          }
	        };

	    // calculate deltaY (and deltaX) according to the event

	    // 'mousewheel'
	    if (originalEvent.wheelDelta) {
	      event.deltaY = - 1/40 * originalEvent.wheelDelta;
	    }
	    // webkit
	    if (originalEvent.wheelDeltaX) {
	      event.deltaX = - 1/40 * originalEvent.wheelDeltaX;
	    }

	    // 'DomMouseScroll'
	    if (originalEvent.detail) {
	      event.deltaY = originalEvent.detail;
	    }

	    return event;
	  },

	  /**
	   * normalise 'deltas' of the mouse wheel
	   * @param   {Function}    originalEvent
	   * @returns {Array}       deltas
	   */
	  delta: function normaliseDelta(originalEvent){
	    var delta = 0,
	      deltaX = 0,
	      deltaY = 0,
	      absDelta = 0,
	      absDeltaXY = 0,
	      fn;

	    // normalise deltas according to the event

	    // 'wheel' event
	    if (originalEvent.deltaY) {
	      deltaY = originalEvent.deltaY * -1;
	      delta  = deltaY;
	    }
	    if (originalEvent.deltaX) {
	      deltaX = originalEvent.deltaX;
	      delta  = deltaX * -1;
	    }

	    // 'mousewheel' event
	    if (originalEvent.wheelDelta) {
	      delta = originalEvent.wheelDelta;
	    }
	    // webkit
	    if (originalEvent.wheelDeltaY) {
	      deltaY = originalEvent.wheelDeltaY;
	    }
	    if (originalEvent.wheelDeltaX) {
	      deltaX = originalEvent.wheelDeltaX * -1;
	    }

	    // 'DomMouseScroll' event
	    if (originalEvent.detail) {
	      delta = originalEvent.detail * -1;
	    }

	    // Don't return NaN
	    if (delta === 0) {
	      return [0, 0, 0];
	    }

	    // look for lowest delta to normalize the delta values
	    absDelta = Math.abs(delta);
	    if (!lowestDelta || absDelta < lowestDelta) {
	      lowestDelta = absDelta;
	    }
	    absDeltaXY = Math.max(Math.abs(deltaY), Math.abs(deltaX));
	    if (!lowestDeltaXY || absDeltaXY < lowestDeltaXY) {
	      lowestDeltaXY = absDeltaXY;
	    }

	    // convert deltas to whole numbers
	    fn = delta > 0 ? 'floor' : 'ceil';
	    delta  = Math[fn](delta / lowestDelta);
	    deltaX = Math[fn](deltaX / lowestDeltaXY);
	    deltaY = Math[fn](deltaY / lowestDeltaXY);

	    return [delta, deltaX, deltaY];
	  }
	};

	if (typeof window.define === 'function' && window.define.amd) {
	  // AMD
	  window.define('hamster', [], function(){
	    return Hamster;
	  });
	} else if (true) {
	  // CommonJS
	  module.exports = Hamster;
	} else {
	  // Browser global
	  window.Hamster = Hamster;
	}

	})(window, window.document);


/***/ }),
/* 26 */,
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

	

	const directiveTemplate 	= __webpack_require__(28)
	const lodash 				= __webpack_require__(3)
	const q 					= __webpack_require__(21)
	const Hamster 				= __webpack_require__(25)
	const $ 					= __webpack_require__(26)

	module.exports = ( dataService, $state, $rootScope ) => {
		
		return {
			scope: {
				pageId: '@',
				scale: '@'
			},
			restrict: 'E',
			replace: false,
			template: directiveTemplate,
			controller: 'pageCtrl'
		}

	}

/***/ }),
/* 28 */
/***/ (function(module, exports) {

	module.exports = "<div id=\"pageframe\" flex=\"100\" ng-cloak>\n\t<div ui-view=\"page\"></div>\n\t<div id=\"zoom-buttons\" layout=\"row\" layout-align=\"center center\">\n\t\t<div class=\"scale-button\" ng-click=\"clickZoom('out')\">\n\t\t\t<i class=\"fa fa-search-minus\" aria-hidden=\"true\"></i>\n\t\t</div>\n\t\t<div flex layout=\"column\" layout-align=\"center stretch\">\n\t\t\t<div class=\"scale-title\">Scale: <strong>{{data.scale}}%</strong></div>\n\t\t\t<md-slider flex ng-change=\"didChange()\" min=\"{{minScale}}\" max=\"{{maxScale}}\" step=\"10\" ng-model=\"data.scale\" aria-label=\"red\" id=\"red-slider\"></md-slider>\n\t\t</div>\n\t\t<div class=\"scale-button\" ng-click=\"clickZoom('in')\">\n\t\t\t<i class=\"fa fa-search-plus\" aria-hidden=\"true\"></i>\n\t\t</div>\n\t</div>\n\t<div id=\"boardlayout\" panhandler>\n<!-- \t\t<div id=\"hline\"></div>\n\t\t<div id=\"vline\"></div> -->\n\t\t<div id=\"boardcontents\">\n\t\t\t<!-- <div id=\"insidevline\"></div> -->\n\t\t\t<div ng-dblclick=\"dblClick(board)\" class=\"boarditem\" ng-repeat=\"board in page.artboards\" style=\"top: {{board.rect.y}}; left: {{board.rect.x}};\">\n\t\t\t\t<div class=\"md-headline\">{{board.name}}</div>\n\t\t\t\t<img ng-src=\"images/{{board.id}}@2x.jpg\" width=\"{{board.rect.width}}\" height=\"{{board.rect.height}}\" alt=\"\">\n\t\t\t</div>\n\t\t</div>\n\t</div>\n</div>"

/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

	// artboard modules components:

	const controller = __webpack_require__(30)
	const directive = __webpack_require__(31)

	module.exports = angular.module('app.artboard', [] )
		.controller( 'artboardCtrl', [ '$scope', 'dataService', controller ] )
		.directive( 'artboard', [ directive ] )


/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

	// artboard controller:

	const lodash = __webpack_require__(3)

	module.exports = ( $scope, dataService ) => {

		// var self = this

		// $scope.page = {}
		// $scope.artboard = {}

		// dataService.get().then(( res ) => {
		// 	
		// 	console.log('D', $scope.page)
		// 	
		// })

		$scope.data = {}
		$scope.data = dataService.data
		$scope.page = {}
		$scope.artboard = {}

		console.log('artboard')

		if($scope.data.returned){
			kickOff()
		}
		$scope.$watch('data.returned', function(){
			if(lodash.isEmpty( $scope.data.pages ) ) return false
			kickOff()
		})

		function kickOff(){

			$scope.page = lodash.find( $scope.data.pages, { id: $scope.pageId })

			$scope.artboard = lodash.find( $scope.page.artboards, { id: $scope.artboardId })

		}

	}

/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

	
	const directiveTemplate = __webpack_require__(32)

	module.exports = () => {
		
		return {
			scope: {
				pageId: '@',
				artboardId: '@'
			},
			restrict: 'E',
			replace: false,
			template: directiveTemplate,
			controller: 'artboardCtrl',
			controllerAs: 'ctrl'
		}

	}

/***/ }),
/* 32 */
/***/ (function(module, exports) {

	module.exports = "<div class=\"artboard-page\" layout-padding ng-cloak>\n\t<div class=\"md-headline\">{{artboard.name}} <span class=\"light\">( {{artboard.rect.width}} x {{artboard.rect.height}} )</span></div>\n\t<div class=\"img-container\">\n\t\t<img width=\"{{artboard.rect.width}}\" height=\"{{artboard.rect.height}}\" ng-src=\"images/{{artboard.id}}@2x.jpg\" alt=\"\">\n\t</div>\n\n</div>"

/***/ })
]);