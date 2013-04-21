(function () {
    "use strict";

    var list = new WinJS.Binding.List();
    var categories = getCategories();    
    var groupedItems = list.createGrouped(
        function groupKeySelector(item) { return item.group.key; },
        function groupDataSelector(item) { return item.group; }
    );

    // TODO: Replace the data with your real data.
    // You can add data from asynchronous sources whenever it becomes available.    
    categories.forEach(function (category) {
        var url = String.empty;

        if (category.key === "all")
            url = "http://backend.deviantart.com/rss.xml?type=deviation";
        else
            url = "http://backend.deviantart.com/rss.xml?type=deviation&q=boost%3A" +
                "newest" + "+in%3A" + category.key;
        
        getRss(url).done(function complete(result) {
            var items = result.responseXML.querySelectorAll("item");
            var groupArts = new Array();
            
            for (var i = 0; i < items.length; i++) {
                var artTitle = items[i].querySelector("title").textContent;
                var link = "<a href=\"" + items[i].querySelector("link").textContent + "\">" + items[i].querySelector("link").textContent + " </a>";
                var thumbnails = items[i].querySelectorAll("thumbnail");
                var fullSizeImages = items[i].querySelectorAll("content");
                var artDescription = items[i].querySelector("description").textContent;

                var usedThumbnail = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAANSURBVBhXY3B0cPoPAANMAcOba1BlAAAAAElFTkSuQmCC";
                var usedArt = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAANSURBVBhXY3B0cPoPAANMAcOba1BlAAAAAElFTkSuQmCC";

                if (thumbnails[1] != null) {
                    usedThumbnail = thumbnails[1].getAttribute("url");
                }

                if (fullSizeImages[0] != null) {
                    usedArt = fullSizeImages[0].getAttribute("url");
                }
                groupArts.push({ group: category, title: artTitle, subtitle: link, description: window.toStaticHTML(artDescription), content: window.toStaticHTML(artDescription), backgroundImage: usedThumbnail, maximizedImage: usedArt });
                list.push({ group: category, title: artTitle, subtitle: link, description: window.toStaticHTML(artDescription), content: window.toStaticHTML(artDescription), backgroundImage: usedThumbnail, maximizedImage: usedArt });
            }
            
            category.backgroundImage = groupArts[0].backgroundImage;            
        });
    });
    

    //categories.forEach(function (category) {        
    //    var arts = new Array();

    //    for (var i = 0; i < categories.length; i++) {            
    //        var url = String.empty;

    //        if (category.key === "all")
    //            url = "http://backend.deviantart.com/rss.xml?type=deviation&q=boost%3Anewest";
    //        else
    //            url = "http://backend.deviantart.com/rss.xml?type=deviation&q=boost%3A" +
    //                "newest" + "+in%3A" + category.key;

    //        getRss(url).done(
    //            function completed(request) {
    //                var items = request.responseXML.querySelectorAll("item");
    //                for (var i = 0; i < items.length; i++) {
    //                    var artTitle = items[i].querySelector("title").textContent;
    //                    var link = "<a href=\"" + items[n].querySelector("link").textContent + "\">" + items[n].querySelector("link").textContent + " </a>";
    //                    var thumbnails = items[i].querySelectorAll("thumbnail");
    //                    var fullSizeImages = items[i].querySelectorAll("content");
    //                    var artDescription = items[i].querySelector("description").textContent;

    //                    var usedThumbnail = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAANSURBVBhXY3B0cPoPAANMAcOba1BlAAAAAElFTkSuQmCC";
    //                    var usedArt = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAANSURBVBhXY3B0cPoPAANMAcOba1BlAAAAAElFTkSuQmCC";

    //                    if (thumbnails[1] != null) {
    //                        usedThumbnail = thumbnails[1].getAttribute("url");
    //                    }

    //                    if (fullSizeImages[0] != null) {
    //                        usedArt = arts[0].getAttribute("url");
    //                    }

    //                    arts.push({ group: category, title: artTitle, subtitle: link, description: window.toStaticHTML(artDescription), content: artDescription, backgroundImage: usedThumbnail, maximizedImage: usedArt });
    //                }
    //            }
    //        );
    //        //
    //        categories[i].backgroundImage = arts[0].backgroundImage;
    //        //arts.push(extractedArts);
    //    }
        
    //    list.push(arts);
    //});
        
    WinJS.Namespace.define("Data", {
        items: groupedItems,
        groups: groupedItems.groups,
        getItemReference: getItemReference,
        getItemsFromGroup: getItemsFromGroup,
        resolveGroupReference: resolveGroupReference,
        resolveItemReference: resolveItemReference
    });

    // Get a reference for an item, using the group key and item title as a
    // unique reference to the item that can be easily serialized.
    function getItemReference(item) {
        return [item.group.key, item.title];
    }

    // This function returns a WinJS.Binding.List containing only the items
    // that belong to the provided group.
    function getItemsFromGroup(group) {
        return list.createFiltered(function (item) { return item.group.key === group.key; });
    }

    // Get the unique group corresponding to the provided group key.
    function resolveGroupReference(key) {
        for (var i = 0; i < groupedItems.groups.length; i++) {
            if (groupedItems.groups.getAt(i).key === key) {
                return groupedItems.groups.getAt(i);
            }
        }
    }

    // Get a unique item from the provided string array, which should contain a
    // group key and an item title.
    function resolveItemReference(reference) {
        for (var i = 0; i < groupedItems.length; i++) {
            var item = groupedItems.getAt(i);
            if (item.group.key === reference[0] && item.title === reference[1]) {
                return item;
            }
        }
    }
        
    function getRss(url) {
        return WinJS.xhr({ url: url });
    }
    
    function getCategories() {        
        var groupDescription = "Group Description: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus tempor scelerisque lorem in vehicula. Aliquam tincidunt, lacus ut sagittis tristique, turpis massa volutpat augue, eu rutrum ligula ante a ante";

        // These three strings encode placeholder images. You will want to set the
        // backgroundImage property in your real data to be URLs to images.
        var darkGray = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAANSURBVBhXY3B0cPoPAANMAcOba1BlAAAAAElFTkSuQmCC";
        var lightGray = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAANSURBVBhXY7h4+cp/AAhpA3h+ANDKAAAAAElFTkSuQmCC";
        var mediumGray = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAANSURBVBhXY5g8dcZ/AAY/AsAlWFQ+AAAAAElFTkSuQmCC";

        var cts = [
            { key: "all", title: "All", subtitle: "All", backgroundImage: darkGray, description: groupDescription },
            { key: "digitalart", title: "Digital Art", subtitle: "Digital Art", backgroundImage: lightGray, description: groupDescription },
            { key: "traditional", title: "Traditional Art", subtitle: "Traditional Art", backgroundImage: mediumGray, description: groupDescription },
            { key: "photography", title: "Photography", subtitle: "Photography", backgroundImage: lightGray, description: groupDescription },
            { key: "artisan", title: "Artisan Crafts", subtitle: "Artisan Crafts", backgroundImage: mediumGray, description: groupDescription },
            { key: "literature", title: "Literature", subtitle: "Literature", backgroundImage: darkGray, description: groupDescription },
            { key: "film", title: "Film & Animation", subtitle: "Film & Animation", backgroundImage: darkGray, description: groupDescription },
            { key: "motionbooks", title: "Motion Books", subtitle: "Motion Books", backgroundImage: darkGray, description: groupDescription },
            { key: "flash", title: "Flash", subtitle: "Flash", backgroundImage: darkGray, description: groupDescription },
            { key: "designs", title: "Design & Interfaces", subtitle: "Design & Interfaces", backgroundImage: darkGray, description: groupDescription },
            { key: "customization", title: "Customization", subtitle: "Customization", backgroundImage: darkGray, description: groupDescription },
            { key: "cartoons", title: "Cartoons & Comics", subtitle: "Cartoons & Comics", backgroundImage: darkGray, description: groupDescription },
            { key: "manga", title: "Manga & Anime", subtitle: "Manga & Anime", backgroundImage: darkGray, description: groupDescription },
            { key: "anthro", title: "Anthro", subtitle: "Anthro", backgroundImage: darkGray, description: groupDescription },
            { key: "fanart", title: "Fan Art", subtitle: "Fan Art", backgroundImage: darkGray, description: groupDescription },
            { key: "resources", title: "Resources & Stock Images", subtitle: "Resources & Stock Images", backgroundImage: darkGray, description: groupDescription },
            { key: "projects", title: "Community Projects", subtitle: "Community Projects", backgroundImage: darkGray, description: groupDescription },
            { key: "contests", title: "Contests", subtitle: "Contests", backgroundImage: darkGray, description: groupDescription },
            { key: "designbattle", title: "Design Challenges", subtitle: "Design Challenges", backgroundImage: darkGray, description: groupDescription },
            { key: "journals", title: "Journals", subtitle: "Journals", backgroundImage: darkGray, description: groupDescription },
            { key: "darelated", title: "devianART Related", subtitle: "devianART Related", backgroundImage: darkGray, description: groupDescription },
            { key: "scraps", title: "Scraps", subtitle: "Scraps", backgroundImage: darkGray, description: groupDescription }
        ];

        return cts;
    }
})();
