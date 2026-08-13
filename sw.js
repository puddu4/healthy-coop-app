const CACHE_NAME = "healthy-coop-v1";
const APP_SHELL = [
      "./",
      "./index.html",
      "./manifest.json",
      "./icon.svg",
      "./data/products_0.json",
      "./data/products_1.json",
      "./data/products_2.json",
      "./data/products_3.json",
      "./data/products_4.json",
      "./data/products_5.json",
      "./data/products_6.json",
      "./data/products_7.json"
    ];

self.addEventListener("install", function(event) {
      event.waitUntil(
              caches.open(CACHE_NAME).then(function(cache) {
                        return cache.addAll(APP_SHELL);
              }).then(function(){ return self.skipWaiting(); })
            );
});

self.addEventListener("activate", function(event) {
      event.waitUntil(
              caches.keys().then(function(keys) {
                        return Promise.all(
                                    keys.filter(function(k){ return k !== CACHE_NAME; }).map(function(k){ return caches.delete(k); })
                                  );
              }).then(function(){ return self.clients.claim(); })
            );
});

self.addEventListener("fetch", function(event) {
      var url = event.request.url;
      if (event.request.method !== "GET") return;

                        if (url.indexOf("/data/products_") !== -1) {
                                event.respondWith(
                                          fetch(event.request)
                                            .then(function(res) {
                                                          var resClone = res.clone();
                                                          caches.open(CACHE_NAME).then(function(cache){ cache.put(event.request, resClone); });
                                                          return res;
                                            })
                                            .catch(function() { return caches.match(event.request); })
                                        );
                                return;
                        }

                        if (url.indexOf(location.origin) === 0) {
                                event.respondWith(
                                          caches.match(event.request).then(function(cached) {
                                                      return cached || fetch(event.request).then(function(res){
                                                                    var resClone = res.clone();
                                                                    caches.open(CACHE_NAME).then(function(cache){ cache.put(event.request, resClone); });
                                                                    return res;
                                                      });
                                          })
                                        );
                        }
});
