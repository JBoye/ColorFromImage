angular.module("umbraco").controller("Boye.ColorFromImageController", function ($scope) {

    var colorThief = new ColorThief();
    $scope.model.palette = [];
    
    $scope.getImageUpload = function (elm) {
        var imageScope = angular.element(elm[0]).scope();
        if (elm.find("img").prop("complete")) {
            $scope.fromImage(elm.find("img")[0]);
        } else {
            elm.find("img").load(function () {
                $scope.$apply(function () {
                    $scope.fromImage(elm.find("img")[0]);
                });
            });
        }
    };

    $scope.getImageCropper = function (elm) {        
        var imageScope = angular.element(elm[0]).scope();
        imageScope.$watch('imageSrc', function (newVal, oldVal) {
            if (newVal == null) {
                imageScope.imageIsLoaded = false;
            }
        });
        /*imageScope.$watch('model.value.focalPoint.left', function (newVal, oldVal) {
            //Experimental - Get ColorFromFocalPoint
            if ($scope.canvas) {
                var newColor = $scope.canvas.getContext('2d').getImageData((imageScope.model.value.focalPoint.left * $scope.canvas.width) - 10, (imageScope.model.value.focalPoint.top * $scope.canvas.height) - 10, 1, 1).data;
                $scope.model.palette[0] = [newColor[0], newColor[1], newColor[2]];
                $scope.setColor($scope.model.palette[0]);
            }
        });*/
        imageScope.$watch('imageIsLoaded', function (newVal, oldVal) {
            if (newVal) {
                $scope.fromImage($("[ng-controller=\"Umbraco.PropertyEditors.ImageCropperController\"] img")[0]);                
            } else {
                $scope.model.palette = [];
            }
        });        
    };

    $scope.fromImage = function (img) {
        $scope.model.palette = colorThief.getPalette(img);
        if ($scope.model.value) {
            var value = hexToRgb($scope.model.value);
            angular.forEach($scope.model.palette, function (color, key) {
                if (color[0] == value[0] && color[1] == value[1] && color[2] == value[2]) {
                    $scope.setColor(color);
                }
            });
        }
        /*
        $scope.canvas = document.createElement('canvas');
        $scope.canvas.width = img.width;
        $scope.canvas.height = img.height;
        $scope.canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);        
        //var pixelData = canvas.getContext('2d').getImageData(event.offsetX, event.offsetY, 1, 1).data;*/
    }

    
    $scope.setColor = function (color) {
        $scope.selectedColor = color;
        $scope.model.value = rgbToHex(color[0], color[1], color[2]);
        $("[ng-controller=\"Umbraco.PropertyEditors.FileUploadController\"] img").css({ "outline": "10px solid " + $scope.model.value, "border": "1px solid rgba(255,255,255,0.5" });
        $("[ng-controller=\"Umbraco.PropertyEditors.ImageCropperController\"] .umb-cropper-gravity .viewport").css({ "outline": "10px solid " + $scope.model.value, "border": "1px solid rgba(255,255,255,0.5" });
    }

    setTimeout(function () { //Make sure the Image Property is rendered before this
        var elm = $("[ng-controller=\"Umbraco.PropertyEditors.ImageCropperController\"], [ng-controller=\"Umbraco.PropertyEditors.FileUploadController\"]");
        if (elm.length > 0) {
            var imageScope = angular.element(elm[0]).scope();
            if (imageScope.model.view == "imagecropper") {
                $scope.getImageCropper(elm);
            } else if (imageScope.model.view == "fileupload") {
                $scope.getImageUpload(elm);
            }
        } else {
            //console.log("No Cropper or Upload property found");
        }
        $("[ng-controller=\"Umbraco.PropertyEditors.ImageCropperController\"] .umb-cropper-gravity").css({ "margin": "10px" });
    }, 1);

    function rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    function hexToRgb(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : null;
    }
});