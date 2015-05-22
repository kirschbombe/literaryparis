define("collections/articles",["jquery","underscore","backbone"],function(i,n,e){"use strict";var t=e.Collection.extend({model:"Article",app:null,init:null,initialize:function(i,n){var e=this;e.app=n.app,e.init=n.init,e.on("complete",function(){e.init.resolve(e)})}});return t});
define("collections/markers",["jquery","underscore","backbone"],function(n,e,i){"use strict";var t=i.Collection.extend({model:"Marker",app:null,init:null,initialize:function(n,e){var i=this;i.app=e.app,i.init=e.init,i.on("complete",function(){i.init.resolve(i)})}});return t});
define("mixins/after",["jquery"],function(e){"use strict";var r={after:function(r){var t=e.Deferred();return this.get(r)?t.resolve():this.on(r,function(){t.resolve()}),t}};return r});
define("mixins/domwatcher",["jquery"],function(e){"use strict";var t={watchDOM:function(t,o,n){if(!o)throw"Empty selector in watchDOM()";if(0===e(o).length){var d=function(){e(o).length>0&&(e(document.body).off("DOMNodeInserted",d),n.resolve())};e(document.body).on("DOMNodeInserted",d),window.setTimeout(function(){e(document.body).off("DOMNodeInserted",d),n.reject()},t)}else n.resolve()}};return t});
define("mixins/fetchxml",["jquery"],function(t){"use strict";var e={fetchXML:function(e,n){var r=t.ajax({type:"GET",url:n,dataType:"xml",success:function(t){return t},fail:function(t,e,r){console.log('Failed to fetch XML at url "'+n+'": '+r)}});return r}};return e});
define("mixins/xml2html",["jquery","underscore"],function(e,t){"use strict";var r={xml2html:function(e,r,n,o){var c;if("string"==typeof r)c=(new DOMParser).parseFromString(r,"text/xml");else{if("object"!=typeof r)throw console.log("Unrecognized doc"),"unrecognized doc";c=r}var i=new XSLTProcessor;i.importStylesheet(c),"object"==typeof n&&t.each(t.keys(n),function(e){i.setParameter(null,e,n[e])});var s;try{var a=i.transformToDocument(e);s=-1!=navigator.userAgent.indexOf("Firefox")?a.documentElement:a.body}catch(u){return""}return"text"===o?s.childNodes[0].textContent:s.innerHTML}};return r});
define("models/app",["jquery","underscore","backbone","models/error/user","views/error/user","routes/router","views/app"],function(e,n,i,t,s,o,r){"use strict";var a=i.Model.extend({config:{},router:null,singletons:{},initialize:function(i){var t=this;t.config=i.config;var s=t._initSingletons();n.extend(t,{classname:"models/app"}),e.when.apply(e,s).done(function(){t.router=new o({app:t,routes:t.config.pages.routes})});new r({model:t})},_initSingletons:function(){var i=this;if(n.has(this.config,"persistance")){n.pluck(n.where(this.config.persistance,{persist:!0,singleton:!0}),"name").forEach(function(n){if(void 0!==i.singletons[n])throw new s({model:new t({msg:"Cannot instantiate from '"+n+"' as non-singleton"})}),"Multiple instantiation in app.initialize";i.singletons[n]=e.Deferred()});var o=[];return n.each(n.keys(i.singletons),function(e){if(!e.match(/^collection/)){var n=i.singletons[e];i._create(e,n),o.push(n.promise())}}),o}},_isSingleton:function(e){return n.has(this.config,"persistance")&&n.where(this.config.persistance,{name:e,persist:!0,singleton:!0}).length>0},_create:function(e,i,t){var s=this;require([e],function(o){var r,a={app:s,init:i};if(e.match(/^collection/))throw"Construct collection synchronously";var c=n.extend(a,t);r=new o(c),r=n.extend(r,{classname:e})})},fetch:function(n,i){var t;return this._isSingleton(n)?t=this.singletons[n]:(t=e.Deferred(),this._create(n,t,i)),t.promise()}});return a});
define("models/article",["jquery","underscore","backbone","views/article","mixins/fetchxml","views/article/menu"],function(e,i,t,n,l,r){"use strict";var a=t.Model.extend({app:null,init:null,initialize:function(i){var t=this;t.app=i.app,t.init=i.init;var n=this.fetchXML(t,t.get("path"));e.when(n).done(function(e){t.set("xml",e),t.init.resolve(t)}).fail(function(e,i,n){console.log("Failed to retrieve article ("+t.get("id")+"), : "+n),t.init.fail()})},defaults:{xml:null,init:!1,marker:null},select:function(){new n({model:this});this.trigger("active")},unselect:function(){this.trigger("inactive")},menulabel:function(e){var i=new r({model:this});return i.render(e)}});return i.extend(a.prototype,l),a});
define("models/issue",["jquery","underscore","backbone","models/article","collections/articles"],function(e,i,t,n,c){"use strict";var l=t.Model.extend({app:null,init:null,initialize:function(t){var l=this;l.app=t.app,l.init=t.init;var o=l.app.config.articles.pathBase,a=l.app.config.articles.files,r=l.app.singletons["collections/articles"],s=new c(null,{model:n,app:l.app,init:r});l.set("collection",s);var f=[],u=i.map(i.range(a.length),function(){return void 0});i.each(a,function(i,t){var n=e.Deferred();f.push(n);var c={articleid:t,articledir:o,path:o+i};l.app.fetch("models/article",c).done(function(e){u[t]=e,l.app.fetch("views/article",{model:e}).done(function(i){e.on("active",i.render,i),e.on("inactive",i.remove,i)}),n.resolve()}).fail(function(){n.fail()})}),e.when.apply({},f).done(function(){s.add(u),s.trigger("complete"),l.on("select",function(e){l._selectArticle(e)}),i.each(f,function(e){e.done(function(e){s.add(e)})}),l.init.resolve(l)}).fail(function(){l.init.fail()})},defaults:{articlefile:"",articledir:"",collection:[],activeArticle:null},_selectArticle:function(e){var t,n=this,c=n.get("collection");if("object"==typeof e)t=e;else{if("number"!=typeof e&&"string"!=typeof e)throw"Bad argument to models/issue";t=c.at(e)}(null===this.get("activeArticle")||this.get("activeArticle")!=e)&&(n.set("activeArticle",t),i.forEach(c.models,function(e){e.trigger("inactive")}),t.init.done(function(){t.trigger("active")}))}});return l});
define("models/map",["jquery","underscore","backbone","collections/markers","models/marker","views/marker","views/article/geojson","mixins/xml2html","views/error/user","models/error/user"],function(e,i,n,o,t,l,a,r,c,s){"use strict";var f=n.Model.extend({app:null,init:null,initialize:function(i){var n=this;n.app=i.app,n.init=i.init;var o,t=n.app.fetch("models/issue"),l=e.Deferred();n.app.fetch("models/issue").done(function(e){n.app.fetch("collections/articles").done(function(e){o=e,l.resolve()})});var a=e.getJSON(n.app.config.map.config,function(e){n.set("mapconfig",e)}).fail(function(e,i,n){console.log("Failed to load map config file: "+n)});e.when(t,l,a).done(function(){n._makeCollection(o,{success:function(){n.init.resolve(n)},fail:function(){n.init.fail()}})}).fail(function(e,i,n){console.log("Failed to init MapModel: "+n),$def.fail()})},defaults:{init:!1,mapconfig:{}},_makeCollection:function(i,n){var r=this,f=r.app.singletons["collections/articles"],p=new o(null,{model:t,app:r.app,init:f});r.set("collection",p);var d=[];i.forEach(function(i){var n=(i.get("articleid"),e.Deferred());d.push(n),i.init.done(function(){var e;try{e=new t({app:r.app,articleModel:i,json:new a({model:i}).render()})}catch(o){return new c({model:new s({msg:o.toString()})}),void n.resolve()}e.on("active",function(){r.app.router.navigate("article/"+e.articleModel.get("articleid"),{trigger:!0})});var f=new l({model:e});e.set("view",f),p.add(e),n.resolve()})}),e.when.apply({},d).done(function(){p.trigger("complete"),n.success()}).fail(function(){n.fail()})}});return i.extend(f.prototype,r),f});
define("models/marker",["jquery","underscore","backbone"],function(e,t,i){"use strict";var n=i.Model.extend({app:null,defaults:{articleModel:null,view:null,json:{}},initialize:function(e){var t=this;t.app=e.app,t.articleModel=e.articleModel,t.app.fetch("models/issue").done(function(e){t.on("active",function(){e.trigger("select",t.get("articleModel"))}),t.articleModel.on("active",function(){t.trigger("active")})})}});return n});
define("models/menu",["jquery","underscore","backbone"],function(e,i,n){"use strict";var t=n.Model.extend({app:null,init:null,initialize:function(e){var i=this;i.app=e.app,i.init=e.init,i.init.resolve(i)},defaults:{items:[]}});return t});
define("routes/router",["jquery","underscore","backbone","models/error/user","views/error/user"],function(e,i,a,t,r){var n=a.Router.extend({app:null,pages:{},initialize:function(e){this.app=e.app,this.pages=this.app.config.pages,a.history.start()},navigate:function(e,i){a.history.fragment!==e&&a.history.navigate(e,i)},page:function(a){var t,r=this;try{if(a||(a=this.pages.home),t=this.pages.pages[a],void 0===t)throw"missing config"}catch(n){return this.page("404")}var o=e.Deferred();r.app.fetch("views/clear").done(function(e){e.render(),o.resolve()}),o.done(function(){i.each(t,function(e){var t,n,o=JSON.parse(JSON.stringify(e));if(i.has(o,"view"))t=o.view,n={};else{if(!i.has(o,"partial")){if(i.has(o,"full"))return void(window.location.href=o.full.page);throw"unsupported page type: "+a}t="views/partial",o.partial.page=r.app.config.pages.pathBase+o.partial.page,n=o.partial}r.app.fetch(t,n).done(function(e){e.render()})})})},article:function(a){e("#titlepage").remove();var t=this,r=[];i.each(["views/issue","views/map","views/menu"],function(i){var a=e.Deferred();r.push(a),t.app.fetch(i).done(function(e){e.render(),a.resolve()})}),e.when.apply({},r).done(function(){t.app.fetch("models/issue").done(function(e){e.trigger("select",a)})}).fail(function(){console.log("Failed to display article: "+a)})}});return n});
define("views/app",["jquery","underscore","backbone"],function(e,n,i){"use strict";var o=i.View.extend({el:"body",initialize:function(){e(window).resize(function(){document.location.reload()})}});return o});
define("views/article",["jquery","underscore","backbone","mixins/domwatcher","mixins/xml2html","text!xsl/article.xsl","text!partials/popover.html","text!partials/popover-content.html","slidesjs"],function(e,i,t,s,l,r,o,n){"use strict";var a=t.View.extend({id:"article",app:null,init:null,initialize:function(e){var i=this;i.app=e.model.app,i.init=e.init,i.init.resolve(i)},render:function(){var i=this;i.$el=e("#"+i.id);var t=this.xml2html(this.model.get("xml"),r,{"article-dir":i.app.config.articles.pathBase});try{e("#"+this.id).append(t)}catch(s){console.log("article load error: "+s.toString())}if(0===e("img.slidesjs-slide").length)e("#footer").remove(),e("article").removeClass("before-footer").addClass("no-footer");else try{i.postprocess()}catch(s){}return i},postprocess:function(){var t=this,s=e("#article article").height()-e("#header").outerHeight(!0);e("#body").css({height:s});var l=i.template(n);e("img.slidesjs-slide").each(function(i,t){var s=t.getAttribute("id"),r=e(".popover."+s).remove(),n=r.find(".head").text(),a=l({desc:r.find(".desc").text(),attr:r.find(".attr").text()});e(t).popover({container:"body",html:!0,content:a,title:n,template:o,trigger:"hover",placement:"left"})});var r=[];return t.$el.find("img.slidesjs-slide").each(function(i,t){var s=e.Deferred();e(t).load(function(){e(t).removeClass("remove"),s.resolve()}),e(t).error(function(){window.setTimeout(function(){s.reject()},500)}),r.push(s)}),e.when.apply({},r).always(function(){e("img.slidesjs-slide.remove").remove(),e(".image-loading").removeClass("image-loading"),e("#slides").slidesjs({navigation:{active:e("img.slidesjs-slide").length>1,effect:"fade"},pagination:{active:e("img.slidesjs-slide").length>1,effect:"fade"},effect:{fade:{speed:100,crossfade:!0}},callback:{loaded:function(i){var t=e(".slidesjs-control").children(":eq("+(i-1)+")");t.css({visibility:"hidden"}),t.css({height:e(".slidesjs-container").height(),width:"auto"});var s=(e(".slidesjs-container").width()-t.width())/2;t.css({left:s}),t.css({visibility:"visible"})},start:function(i){e(".slidesjs-control").children().css({visibility:"hidden"})},complete:function(i){var t=i-1,s=e(".slidesjs-control").children(":eq("+t+")");s.css({height:e(".slidesjs-container").height(),width:"auto",position:"relative"}),s.css({visibility:"visible"})}}})}),t}});return i.extend(a.prototype,s),i.extend(a.prototype,l),a});
define("views/clear",["jquery","underscore","backbone"],function(e,i,n,t){"use strict";var r=n.View.extend({el:"body",app:null,init:null,initialize:function(e){var i=this;i.app=e.app,i.init=e.init,i.init.resolve(i)},render:function(){e("body").empty()}});return r});
define("views/issue",["jquery","underscore","backbone","text!partials/issue.html"],function(e,i,t,n){"use strict";var s=t.View.extend({el:"#issue",template:i.template(n),app:null,init:null,initialize:function(e){var i=this;i.app=e.app,i.init=e.init,this.app.fetch("models/issue").done(function(e){i.model=e,i.init.resolve(i)})},render:function(){this.$el.remove(),e("body").append(n)}});return s});
define("views/map",["jquery","underscore","backbone","leaflet","text!partials/map.html"],function(e,n,t,i,o){"use strict";var a=t.View.extend({id:"map",tagName:"div",app:null,init:null,initialize:function(e){var n=this;n.app=e.app,n.init=e.init,this.app.fetch("models/map").then(function(e){n.model=e,n.listenToOnce(e,"change",n.render),n.init.resolve(n)}).fail(function(e){console.log("Failed to init map view.")})},render:function(){var n=this;if(!(e("#"+this.id).children().length>0)){e("body").append(o);var t=this.model.get("collection"),a=this.model.get("mapconfig"),r=new i.Map(a.id,a.map),p=new i.TileLayer(a.tileLayer.url,a.tileLayer.opts);r.setView(new i.LatLng(a.view.lat,a.view.lng),a.view.zoom),r.addLayer(p);var c=i.control.scale(a.scale);c.addTo(r);var l={},u=function(e){return e.lat.toString()+e.lng.toString()};r.invalidateSize();var s=function(){t.forEach(function(e){var t=e.get("json"),o=e.get("view");i.geoJson(t,{onEachFeature:function(t,r){var p=i.popup(a.features.popup);p.setContent(o.el),r.bindPopup(p),r.removeEventListener("click"),r.on("click",function(){e.trigger("active")}),r.on("mouseover",function(){n.app.config.map.hoverPopup&&(l[u(r.getLatLng())]||r.openPopup())}),e.on("active",function(e){l[u(r.getLatLng())]||r.openPopup()}),l[u(r.getLatLng())]=!1},pointToLayer:function(e,n){return i.marker(n,{icon:i.icon(a.features.icon),clickable:!!e.properties.text,title:e.properties.markername||"",opacity:a.features.opacity,riseOnHover:a.features.riseOnHover})}}).addTo(r)}),r.on("popupopen",function(e){l[u(e.popup.getLatLng())]=-1!=navigator.userAgent.indexOf("Firefox")?!0:!0}),r.on("popupclose",function(e){l[u(e.popup.getLatLng())]=-1!=navigator.userAgent.indexOf("Firefox")?!1:!1})};window.setTimeout(s,n.app.config.map.markerDelay)}}});return a});
define("views/marker",["jquery","underscore","backbone","text!partials/marker.html"],function(e,t,i,r){"use strict";var a=i.View.extend({template:t.template(r),el:"",initialize:function(){this.$el.html(this.template({articleid:this.model.attributes.articleid,geojson:this.model.attributes.json}))}});return a});
define("views/menu",["jquery","underscore","backbone","text!partials/menu.html","mixins/domwatcher"],function(e,n,t,i,r){"use strict";var o=t.View.extend({template:n.template(i),el:"#menu",id:"menu",app:null,init:null,initialize:function(e){var n=this;n.app=e.app,n.init=e.init,n.app.fetch("models/menu",{items:n.app.config.menu}).done(function(e){n.model=e,n.init.resolve(n)})},render:function(){var t=this,i=this.model.get("items"),r=[],o={},a={};n.each(i,function(n){if(o[n.partial]="","menu"===n.type){var i=e.Deferred();t.app.fetch(n.collection).done(function(e){a[n.collection]=e,i.resolve()}),r.push(i.promise())}}),n.each(n.keys(o),function(t){var i=e.Deferred();require(["text!"+t],function(e){o[t]=n.template(e),i.resolve()}),r.push(i.promise())});var l="";e.when.apply(e,r).done(function(){n.forEach(i,function(e,n){var t=e.partial;if("page"===e.type||"sep"===e.type)l+=o[t](e);else if("menu"===e.type){var i="";a[e.collection].models.forEach(function(n,t){var r=e.item.href.replace(":i",t);i+=n.menulabel({href:"#"+r})}),l+=o[t]({label:e.label,items:i})}})}).done(function(){t.$el.empty().append(t.template({content:l}));var n=e.Deferred();n.fail(function(){t.render()}),t.watchDOM(500,"#"+t.id,n)}).fail(function(){new UserErrorView({model:new UserErrorModel({msg:"Failed to build menu."})})})}});return n.extend(o.prototype,r),o});
define("views/page",["jquery","underscore","backbone","mixins/domwatcher","text!partials/page.html"],function(e,i,t,n,r){"use strict";var a=t.View.extend({el:"body",app:null,init:null,initialize:function(e){var i=this;i.app=e.app,i.init=e.init,i.init.resolve(i)},render:function(){var i=this,t=e.Deferred();t.then(function(){e(i.el).append(r)}),this.watchDOM(1e3,i.el,t)}});return i.extend(a.prototype,n),a});
define("views/partial",["jquery","underscore","backbone","mixins/domwatcher"],function(e,i,n,t){"use strict";var r=n.View.extend({el:"",app:null,init:null,page:"",initialize:function(e){var i=this;i.app=e.app,i.init=e.init,i.el=e.el,require(["text!"+e.page],function(e){i.page=e,i.init.resolve(i)})},render:function(){var i=this,n=e.Deferred();n.then(function(){e(i.el).append(i.page)}),this.watchDOM(1e3,i.el,n)}});return i.extend(r.prototype,t),r});
define("models/error/user",["backbone"],function(e){"use strict";var r=e.Model.extend({defaults:{msg:""}});return r});
define("views/article/geojson",["jquery","underscore","backbone","mixins/xml2html","text!xsl/geojson.xsl"],function(e,t,r,o,n){"use strict";var i=r.View.extend({render:function(e){var t=this,r=(new DOMParser).parseFromString(n,"text/xml");if("resolved"!==this.model.init.state())throw"Uninitialized article in GeoJsonView";var o;try{o=JSON.parse(t.xml2html(t.model.get("xml"),r,{},"text"))}catch(i){throw console.log("Failed to parse to json: "+i.toString()),"Failed to parse to json: "+i.toString()}return o}});return t.extend(i.prototype,o),i});
define("views/article/menu",["jquery","underscore","backbone","mixins/xml2html","text!xsl/article-menu.xsl"],function(e,t,r,i,n){"use strict";var l=r.View.extend({render:function(e){var t=this,r=(new DOMParser).parseFromString(n,"text/xml");if("resolved"!==this.model.init.state())throw"Uninitialized article in ArticleMenuView";var i=t.xml2html(t.model.get("xml"),r,e);return i}});return t.extend(l.prototype,i),l});
define("views/error/user",["jquery","backbone","text!partials/error/user.html"],function(e,t,r){"use strict";var i=t.View.extend({template:_.template(r),el:e("#errorDialog"),initialize:function(){this.render()},render:function(){return this.$el.html(this.template(this.model.attributes)),this.$el.modal({keyboard:!0,show:!0}),this}});return i});
require.config({paths:{text:"//cdnjs.cloudflare.com/ajax/libs/require-text/2.0.12/text.min",jquery:"//code.jquery.com/jquery-2.1.4.min",bootstrap:"//maxcdn.bootstrapcdn.com/bootstrap/3.3.4/js/bootstrap.min",backbone:"//cdnjs.cloudflare.com/ajax/libs/backbone.js/1.1.2/backbone-min",underscore:"//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.8.3/underscore-min",leaflet:"//cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.3/leaflet",slidesjs:"//cdnjs.cloudflare.com/ajax/libs/slidesjs/3.0/jquery.slides.min",partials:"../partials",xsl:"../script/xsl",pages:"../pages"},shim:{bootstrap:{deps:["jquery"]},backbone:{deps:["jquery","underscore"],exports:"Backbone"},underscore:{exports:"_"},text:{deps:[]},slidesjs:{deps:["jquery"]}}}),require(["jquery","models/error/user","views/error/user","models/app","bootstrap"],function(e,s,o,r){"use strict";var a=e("#main").attr("data-config");a?e.getJSON(a,function(e){new r({config:e})}).fail(function(e,r,n){new o({model:new s({msg:"Failed to load site config file '"+a+"' "+n})})}):new o({model:new s({msg:"No configuration filename specified in home page."})})});