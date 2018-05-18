angular.module('ng-virtual-keyboard', [])

.constant('VKI_CONFIG', {
    layout: 'custom',
    customLayout: {
          'shift': [
            '! @ # $ % ^ & * ( )',
            'Q W E R T Y U I O P',
            'A S D F G H J K L {accept}',
            '{shift} Z X C V B N M < >',
            '{space} {bksp}'
          ],
          'normal': [
            '1 2 3 4 5 6 7 8 9 0',
            'q w e r t y u i o p ',
            'a s d f g h j k l {accept}',
            '{shift} z x c v b n m , .',
            '{space} {bksp}'
          ]
    },
    usePreview: false,
    shiftActive: true,
    autoAccept: true
})

.service('ngVirtualKeyboardService', ['VKI_CONFIG', function(VKI_CONFIG) {
	var clone = function(obj){
			var copy;

			// Handle the 3 simple types, and null or undefined
			if (null === obj || 'object' !== typeof obj) {
				return obj;
			}


			// Handle Date
			if (obj instanceof Date) {
					copy = new Date();
					copy.setTime(obj.getTime());
					return copy;
			}

			// Handle Array
			if (obj instanceof Array) {
					copy = [];
					for (var i = 0, len = obj.length; i < len; i++) {
							copy[i] = clone(obj[i]);
					}
					return copy;
			}

			// Handle Object
			if (obj instanceof Object) {
					copy = {};
					for (var attr in obj) {
							if (obj.hasOwnProperty(attr)) {
								copy[attr] = clone(obj[attr]);
							}
					}
					return copy;
			}

			throw new Error('Unable to copy obj! Its type isn\'t supported.');
	};

	var executeGetKeyboard = function(elementReference){
		var keyboard;
		var element = $(elementReference);
		if (element) {
			keyboard = $(elementReference).getkeyboard();
		}
		return keyboard;
	};

	return {
		attach: function(element, config, inputCallback){
			var newConfig = clone(VKI_CONFIG);

			config = config || {};

			for (var attr in config) {
				if (config.hasOwnProperty(attr)) {
					newConfig[attr] = config[attr];
				}
			}

			newConfig.accepted = config.accepted || inputCallback;

			var keyboard = $(element).keyboard(newConfig);

			if (keyboard && newConfig.extensions) {
				for (var extension in newConfig.extensions) {
					var extConfig = newConfig.extensions[extension];
					if (extConfig) {
						keyboard[extension](extConfig);
					} else {
						keyboard[extension]();
					}
				}
			}
		},
		getKeyboard: function(elementReference){
			return executeGetKeyboard(elementReference);
		},
		getKeyboardById: function(id){
			return executeGetKeyboard('#' + id);
		}
	};
}])

.directive('ngVirtualKeyboard', ['ngVirtualKeyboardService', '$timeout',
	function(ngVirtualKeyboardService, $timeout) {
	return {
		restrict: 'A',
		require : '?ngModel',
		scope: {
			config: '=ngVirtualKeyboard'
		},
		link: function(scope, elements, attrs, ngModelCtrl) {
			if(!ngModelCtrl){
				return;
			}

			ngVirtualKeyboardService.attach(elements[0], scope.config, function() {
				$timeout(function() {
					ngModelCtrl.$setViewValue(elements[0].value);
				});
			});
		}
	};
}]);
