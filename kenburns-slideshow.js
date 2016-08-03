define(['datetime', 'dialogHelper', 'connectionManager', 'css!./style', 'html!./icons'], function (datetime, dialogHelper, connectionManager) {

    return function (options) {

        var self = this;
        var dlg;

        self.show = function () {
            createElements(options);

            startSlideshow(options);
        };

        function createElements(options) {

            dlg = dialogHelper.createDialog({
                exitAnimationDuration: 800,
                size: 'fullscreen'
            });

            dlg.classList.add('slideshowDialog');

            var html = '<div class="kenburns-slideshowImage" id="kenburns-slideshow"></div><h1 class="kenburns-slideshowImageText"></h1>';
            dlg.innerHTML = html;

            document.body.appendChild(dlg);

            dialogHelper.open(dlg).then(function () {
                dlg.parentNode.removeChild(dlg);
            });
        }

        function startSlideshow(options) {

            var items = options.items;

            var imgUrls = [];
            $.each(items, function (index, item) {
                var url = getImgUrl(item);
                if (url != null)
                    imgUrls.push(url);
            });

            var cardImageContainer = dlg.querySelector('.kenburns-slideshowImage');
            var newCardImageContainer = document.createElement('div');
            cardImageContainer.parentNode.appendChild(newCardImageContainer);

            var width = window.innerWidth / options.scale;
            var height = window.innerHeight / options.scale;

            cardImageContainer.style.width = width + "px";
            cardImageContainer.style.height = height + "px";

            $('#kenburns-slideshow').Kenburns({
                images: imgUrls,
                scale: options.scale,
                duration: options.interval,
                fadeSpeed: options.fadeSpeed,
                ease3d: 'cubic-bezier(0.445, 0.050, 0.550, 0.950)',
                loaderPosX: (window.innerWidth / 2 - 16),
                loaderPosY: (window.innerHeight / 2 - 16),

                onSlideComplete: function () {
                    if (!items[this.getSlideIndex()].PremiereDate)
                        return;

                    var date = datetime.parseISO8601Date(items[this.getSlideIndex()].PremiereDate);
                    if (date && document.querySelector('.kenburns-slideshowImageText'))
                        document.querySelector('.kenburns-slideshowImageText').innerHTML = date.toLocaleDateString();
                }
            });
        }

        function getImgUrl(item) {

            var apiClient = connectionManager.getApiClient(item.ServerId);

            return getImageUrl(item, {
                type: "Primary",
                maxWidth: window.innerWidth / options.scale,
                maxHeight: window.innerHeight / options.scale
            }, apiClient);
        }

        function getImageUrl(item, options, apiClient) {

            options = options || {};
            options.type = options.type || "Primary";

            if (typeof (item) === 'string') {
                return apiClient.getScaledImageUrl(item, options);
            }

            if (item.ImageTags && item.ImageTags[options.type]) {

                options.tag = item.ImageTags[options.type];
                return apiClient.getScaledImageUrl(item.Id, options);
            }

            if (options.type == 'Primary') {
                if (item.AlbumId && item.AlbumPrimaryImageTag) {

                    options.tag = item.AlbumPrimaryImageTag;
                    return apiClient.getScaledImageUrl(item.AlbumId, options);
                }
            }

            return null;
        }

        self.hide = function () {
            var dialog = dlg;
            if (dialog) {

                dialogHelper.close(dialog);
            }
        };
    }
});