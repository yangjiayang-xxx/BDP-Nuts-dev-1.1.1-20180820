(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.derequire = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * Dialog
 * 17/10/18 - 增加Dialog.toast(msg,[options]) 提示组件。
 * 17/9/20 - 修复当Dialog在最大化状态下页面resize时Dialog位置错误问题。
 *
 * @author yswang
 * @version 4.3.0 2017/10/18
 */
(function (root, doc, undefined) {
	
	var _isIE6 = !-[1,]&&!root.XMLHttpRequest,
	
	_isFunc = function(func) {
		return func && typeof func === 'function';
	},
	
	// 获取最顶层的window对象
	_topWin = (function() {
		var twin = root;
		while(twin.parent && twin.parent !== twin) {
		  try {
				// 跨域
				if(twin.parent.document.domain !== doc.domain) {
					break;
				}
		  } catch(e) {
				break;
		  }
			twin = twin.parent;
		};
		return twin;
	})(),
	
	// 计算window相关尺寸
	_winSize = function(win) {
		win = win || root;
		var doc = win.document,
				cw = doc.compatMode === "BackCompat" ? doc.body.clientWidth : doc.documentElement.clientWidth,
				ch = doc.compatMode === "BackCompat" ? doc.body.clientHeight : doc.documentElement.clientHeight,
				sl = Math.max(doc.documentElement.scrollLeft, doc.body.scrollLeft),
				st = Math.max(doc.documentElement.scrollTop, doc.body.scrollTop),
				sw = Math.max(doc.documentElement.scrollWidth, doc.body.scrollWidth),
				sh = Math.max(doc.documentElement.scrollHeight, doc.body.scrollHeight);
	    
		(sh < ch) && (sh = ch);

	  return { "cw": cw, "ch": ch, "sl": sl, "st": st, "sw": sw, "sh": sh };
	},
	
  // 获取相对文档的坐标
	_offset = function(elem, relative, doc) {
		var lft = elem.offsetLeft, 
				top = elem.offsetTop, 
				op = elem.offsetParent;
				
		while(op != null) {
			lft += op.offsetLeft;
			top += op.offsetTop;
			op = op.offsetParent;
		}
		
		if(relative) {
			!doc && (doc = document);
			var sl = st = 0;
			if(doc.compatMode == 'BackCompat') {
				sl = doc.body.scrollLeft;
				st = doc.body.scrollTop;
			} else {
				sl = doc.documentElement.scrollLeft;
				st = doc.documentElement.scrollTop;
			}
			
			lft -= sl;
			top -= st;
		}
		
		return {'left': lft, 'top': top, 'right': (lft + elem.offsetWidth), 'bottom': (top + elem.offsetHeight)};
	},
	
	// 获取滚动条宽度
	_scrollSize = function(doc) {
		!doc && (doc=document);
		var spacer = doc.createElement('div');
		spacer.style.cssText = 'position:absolute;left:0;top:-999px;width:100px;height:100px;overflow:scroll;';
		doc.body.appendChild(spacer);
		var ssize = spacer.offsetWidth - spacer.clientWidth;
		doc.body.removeChild(spacer);
		return ssize;
	},
	
	// 事件处理
	_EvtUtils = (function() {
		var i = 1, listeners = {};
		return {
			bind: function(elem, type, callback, useCapture) {
				var _capture = useCapture !== undefined ? useCapture : false;
				elem.addEventListener ? elem.addEventListener(type, callback, _capture) 
									  : elem.attachEvent('on' + type, callback);
			},
			unbind: function(elem, type, callback, useCapture){
				var _capture = useCapture !== undefined ? useCapture : false;
				elem.removeEventListener ? elem.removeEventListener(type, callback, _capture) 
						                 : elem.detachEvent('on' + type, callback);
			},
			add: function(elem, type, callback) {
				_EvtUtils.bind(elem, type, callback, false);
				listeners[i] = {"elem": elem, "type": type, "callback": callback, "capture": false};
				return (i++);
			},
			remove: function(id) {
				if (listeners.hasOwnProperty(id)) {
					var h = listeners[id];
					_EvtUtils.unbind(h.elem, h.type, h.callback, h.capture);
					delete listeners[id];
				}
			},
			fix: function(evt) {
				var sl = Math.max(doc.documentElement.scrollLeft, doc.body.scrollLeft),
					st = Math.max(doc.documentElement.scrollTop, doc.body.scrollTop),
					eventObj = {
						target: evt.srcElement || evt.target,
						pageX: (evt.clientX + sl - doc.body.clientLeft),
						pageY: (evt.clientY + st - doc.body.clientTop),
						preventDefault: function () {evt.returnValue = false;},
						stopPropagation: function () {evt.cancelBubble = true;}
					};
				
				// IE6/7/8 在原生window.event对象写入数据会导致内存无法回收，应当采用拷贝
				for(var i in evt) {
					eventObj[i] = evt[i];
				}
				
				return eventObj;
			},
			stop: function(evt) {
				if(evt.stopPropagation) {
					evt.preventDefault();
					evt.stopPropagation();
				}else {
					evt.cancelBubble = true;
					evt.returnValue = false;
				}
			}
		};
	})(),
	
	// css相关操作
	_css = (function(){
		return {
			'get': ('defaultView' in doc) && ('getComputedStyle' in doc.defaultView) ?
				function (elem, name) {
					// borderLeftWidth 格式变为 border-left-width格式
					name = name.replace(/([A-Z]|^ms)/g, '-$1').toLowerCase();
					return doc.defaultView.getComputedStyle(elem, false).getPropertyValue(name);
				} : function (elem, name) {
					// border-left-width 格式变为 borderLeftWidth 格式
					name = name.replace(/^-ms-/, 'ms-').replace(/-([a-z]|[0-9])/ig, function(all, letter) {
						return (letter + '').toUpperCase();
					});	
					return elem.currentStyle[name];
			},
			'has': function(elem, clsname) {
				//return new RegExp("(^|\\s)" + clsname + "(\\s|$)").test(elem.className);
				// 采用最简单的方法
				return (' '+ elem.className +' ').indexOf(' '+ clsname +' ') !== -1;
			},
			'add': function(elem, clsname) {
				!_css.has(elem, clsname) && (elem.className += (' '+ clsname));
			},
			'remove': function(elem, clsname) {
				_css.has(elem, clsname) && (elem.className = elem.className.replace(new RegExp('(^|\\s)' + clsname + '(\\s|$)'), ' ').replace(/^\s+|\s+$/g, ''));
			}
		};
	})();
	
	_int = function(str, defVal) {
		var val = parseInt(str, 10);
		return isNaN(val) ? defVal : val;
	},
	
	// 获取url中的参数
	_queryParam = function(url, name){
		var sUrl = url.slice(url.indexOf('?') + 1),
				r = sUrl.match(new RegExp('(^|&)' + name + '=([^&]*)(&|$)'));
		return (r === null ? null : unescape(r[2]));
	},
	
	// 支持innerHTML中包含<style>和<script>脚本
	_innerHTML = function(el, htmlCode, win) {
		if(!el || htmlCode === null || typeof htmlCode === 'undefined') { 
			return; 
		}
		
		if(htmlCode.indexOf('<') === -1) {
			el.innerHTML = htmlCode;
			return;
		}
		
		// for IE innerHTML css style hack
		htmlCode = '<i style="display:none;">for IE css hack</i>'+ htmlCode;
		el.innerHTML = htmlCode;
		// for IE css hack
		el.removeChild(el.firstChild);
		
		var scripts = el.getElementsByTagName('script'), 
			oScript = null, srcs= [], loaded = [], text = [], i, 
			eDoc = el.ownerDocument, 
			head = eDoc.getElementsByTagName('head')[0] || eDoc.documentElement;
		
		// 动态执行脚本
		var evalScript = function(data) {
			var script = eDoc.createElement('script');
		    script.type = 'text/javascript';
		    try {
		      script.appendChild(eDoc.createTextNode(data));      
		    } catch(e) {
		      // IE hack
		      script.text = data;
		    }

		    head.insertBefore(script, head.firstChild);
		    head.removeChild(script);
		    script = null;
		};
		
		if(!scripts || scripts.length === 0) {
			eDoc = head = null;
			return;
		}
		
		for(i = 0; i < scripts.length; i++) {
			oScript = scripts[i];
			// 不是标准的script脚本，不进行额外处理
			var otype = oScript.getAttribute('type');
			if(otype && otype.length > 0 
					&& !(/^(text\/javascript|text\/vbscript|text\/ecmascript|application\/javascript|application\/ecmascript)$/.test(otype.replace(/^\s+|\s+$/g, '').toLowerCase()))) {
				continue;
			}

			if(oScript.src) {
				srcs.push(oScript.src);
				loaded.push(0);
			} else {
				text.push(oScript.text || oScript.textContent || oScript.innerHTML || '');
			}
		}
		
		if(srcs.length === 0) {
			evalScript(text.join(' '));
			eDoc = head = null;
			return;
		}
		
		for(i = 0; i < srcs.length; i++) {
			(function(a){
				var script = eDoc.createElement('script');
				script.setAttribute('type', 'text/javascript');
				try {
					script.setAttribute('defer', 'defer');
				} catch(e){}
				
				script.setAttribute('src', srcs[a]);
				script.onload = script.onreadystatechange = function() {
					if(!loaded[a] && (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete')) {
						loaded[a] = 1;
						script.onload = script.onreadystatechange = null;
						if(head && script.parentNode) {
							head.removeChild(script);
							script = null;
						}
					}
				};
				
				head.insertBefore(script, head.firstChild);
			})(i);
		}
		
		// 保证所有js文件全部加载完毕后才进行script代码执行
		var checkDone = function() {
			var s = 0;
			for(var i = 0; i < loaded.length; i++) {
				s += loaded[i];
			}
			
			var done = (s === loaded.length);
			if(done) {
				root.clearTimeout(root['_idlg_scriptloaded_tid']);
				evalScript(text.join(' '));
				eDoc = head = null;
				return;
			}
			
			root['_idlg_scriptloaded_tid'] = root.setTimeout(function() {
				root.clearTimeout(root['_idlg_scriptloaded_tid']);
				checkDone();
			}, 4);
		};
		
		checkDone();
	},
	
	// 获取当前加载的js的url路径
	_selfPath = (function(scripts) {
		return scripts[scripts.length-1].src;
	})(doc.getElementsByTagName('script'));
	
	
	// 开启IE6 CSS背景图片缓存，避免背景图片闪烁
	 try {
   		doc.execCommand('BackgroundImageCache', false, true);
   } catch(e) {}
	
     
	//-----------------------------------------------------------------------------------
	//	对话框模块， 核心类 Dialog
	//-----------------------------------------------------------------------------------
	var Dialog = function(config) {

		var cfg = config || {}, dlg = null;
		
		// 合并配置项
		for(var p in Dialog.defaults) {
			if(!cfg.hasOwnProperty(p)) {
				cfg[p] = Dialog.defaults[p];
			}
		}
		
		cfg.id = cfg.id || 'idlg'+ (+new Date());
		
		for(var i = 0, len = _topWin['_idlg_list_'].length; i < len; i++) {
			if(_topWin['_idlg_list_'][i].id === cfg.id) {
				dlg = _topWin['_idlg_list_'][i];
			}
		}

		if(dlg) {
			dlg.focus();
			return dlg;
		}
		
		var _follow = cfg.follow || {'target': null};
		if(typeof _follow === 'string' || _follow.tagName) {
			_follow = {'target': _follow.tagName ? _follow : document.getElementById(_follow), 
									'placement':'bottom' };
		} 
		else if(typeof _follow === 'object' && _follow['target']) {
			_follow = {'target': typeof _follow['target'] === 'string' ? document.getElementById(_follow['target']) : _follow['target'],
                  'placement': _follow['placement'] };
		}
		
		if(_follow && _follow['target']) {
			cfg.follow = _follow;
			cfg.context = root;
			cfg.fixed = false;
			cfg.modal = false;
		}

		// 指定了Dialog显示的容器
		if(cfg.container) {
			cfg.container = typeof cfg.container === 'string' 
												? document.getElementById(cfg.container) 
												: cfg.container;
			if(!cfg.container.tagName) {
				throw new Error('Dialog `container` must be Html Element object!');
			}

			cfg.context = cfg.container.ownerDocument.defaultView || cfg.container.ownerDocument.parentWindow;
			cfg.fixed = false;
			
			if('BODY' !== cfg.container.tagName) {
				cfg.modal = false;
				cfg.dragable = false;
			}
		}
		
		cfg.context = cfg.context || _topWin;
		_isIE6 && (cfg.fixed = false);
		
		return new Dialog.fn.constructor(cfg);
	};
	
	Dialog.fn = Dialog.prototype = {
		
		version: '4.3.0',
		
		// ------------------------ private method -----------------------------
		constructor: function(cfg) {
			this.config 		= cfg;
			this.id 				= cfg.id;
			this.context 		= cfg.context;
			this.openerWindow  	= null;
			this.openerDialog  	= null;
			this.innerWindow   	= null;
			//this.innerDocument 	= null;
			
			this._contextDoc 	= cfg.context.document;
			this._container = cfg.container || this._contextDoc.body;
			this._zindex 		= 9999 || cfg.zindex;
			this._childList 	= []; // 存放子窗口
			this._unauthorized 	= false;
			this._maximized 	= false;
			this._closed 		= false;
			
			!this.DOM && (this.DOM = this._getDOM());
			this.htmlElement 	= this.DOM.wrap;
			
			var dom = this.DOM, _theme = '';
			
			// 通过 dialog.js?theme= 传递的主题样式
			if(_queryParam(_selfPath, 'theme')) {
				_theme += (' ' + _queryParam(_selfPath, 'theme'));
			}
			// 通过Dialog.open({"theme":""}) 传递的主题
			if(typeof(cfg.theme) == 'string') {
				_theme += (' ' + cfg.theme);
			}
				
			if(_theme !== '') {
				dom.outer.className += _theme;
			}
			
			if(cfg.closable) {
				dom.close.style.display = 'block';
			}
			
			if(cfg.maxable) {
				dom.max.style.display = 'block';
			}
			
			if(cfg.minable) {
				dom.min.style.display = 'block';
			}

			// 设置标题
			this.title(cfg.title);
			
			// 创建.confirm
			this.button.apply(this, cfg.button);

			// 计算main相对于wrap周围的间隙，用于准确计算main的尺寸:
			// main.w = W - 四周水平方向间隙 - 内部水平填充间隙
			// main.h = H - 四周竖直方向间隙 - 内部竖直填充间隙
			var wrapOffset = _offset(dom.wrap),
					mainOffset = _offset(dom.main);
			
			this._mainGaps = {
				'h_gap': (mainOffset.left - wrapOffset.left + wrapOffset.right - mainOffset.right),
				'v_gap': (mainOffset.top - wrapOffset.top + wrapOffset.bottom - mainOffset.bottom),
				'h_fill': (_int(_css.get(dom.main, 'paddingLeft'), 0) 
										+ _int(_css.get(dom.main, 'borderLeftWidth'), 0) 
										+ _int(_css.get(dom.main, 'paddingRight'), 0)
										+ _int(_css.get(dom.main, 'borderRightWidth'), 0)),
				'v_fill': (_int(_css.get(dom.main, 'paddingTop'), 0) 
										+ _int(_css.get(dom.main, 'borderTopWidth'), 0) 
										+ _int(_css.get(dom.main, 'paddingBottom'), 0)
										+ _int(_css.get(dom.main, 'borderBottomWidth'), 0))
			};
			
			this.size(cfg.width, cfg.height).resetPosition();
			
			if(cfg.url && typeof cfg.url === 'string' && cfg.url.length > 0) {
				var ifrm = this._iframe();
				ifrm.src = cfg.url;

				//暂时采用这种方式解决 iframe onload 被内页请求阻塞导致ownerDialog无法赋值问题。
				setTimeout((function(dlg, ifrm) {
					return function() {
						try {
							ifrm.contentWindow['ownerDialog'] = dlg;
							dlg.innerWindow = ifrm.contentWindow;
						} catch(e) {
							//ignore
						}
					};
				})(this, ifrm), 250);
			} 
			else {
				this.content(cfg.content);
			}
			
			cfg.modal && this._lock();
			
			// 置顶窗口
			this.focus();
			this._addEvent();
			
			try {
				_isFunc(cfg.onShow) && cfg.onShow.call(this);
			} catch(e){}
	
			this.openerWindow = root;
			root.ownerDialog && (this.openerDialog = root.ownerDialog);
			
			// 在窗口管理器中注册新的窗口对象
			_topWin['_idlg_list_'].unshift(this);
			
			// 如果当前窗口是从另外一个Dialog窗口内部弹出来，则作为父Dialog的子窗口
			if(this.openerDialog) {
				this.openerDialog._childList.unshift(this);
			}
		},

		_getDOM: function() {
			var cfg = this.config, dom = {},
				//$body = this._contextDoc.body,
				$body = this._container,
				$wrap = this._contextDoc.createElement('div');
			
			$wrap.style.cssText = 'position:'+ (cfg.fixed ? 'fixed' : 'absolute') +';left:0;top:0;padding:0 !important;margin:0 !important;border:0 none !important;';
			$wrap.className = 'idlg';
			$wrap.setAttribute('tabindex', -1);
			$wrap.setAttribute('role', 'dialog');
			//$body.insertBefore($wrap, $body.firstChild);
			$body.appendChild($wrap);
			
			$wrap.innerHTML = Dialog._tmpl.replace('{rs_tmpl}', cfg.resizable ? Dialog.rs_tmpl : '');
			
			var eles = $wrap.getElementsByTagName('*'), _class;
			for(var i = 0, len = eles.length; i < len; i++) {
				_class = eles[i].className;
				if(!_class || _class.indexOf('idlg-') === -1) {
					continue;
				}

				dom[_class.split('-')[1]] = eles[i];
			}
			
			dom.wrap = $wrap;
			return dom;
		},
		
		_iframe: function() {
			var dom = this.DOM,
				$content = dom.main,
				$iframe = dom.iframe;
				
			if($iframe) {
				return $iframe;
			}
			
			_innerHTML($content, Dialog.ifrm_tmpl, this.context);
			
			$iframe = dom.iframe = $content.getElementsByTagName('iframe')[0];
			dom.iframeCover = $content.getElementsByTagName('div')[0];

			var _iframeLoad = this.iframeLoad = (function(diag) { 
		   		return function(evt) {
						var frm = (evt||window.event).srcElement || (evt||window.event).target;
						try {
							//frm.contentWindow['ownerDialog'] = diag;
							//diag.innerWindow = frm.contentWindow;
							//diag.innerDocument = frm.contentWindow.document;
				
							// 自适应高度
							if(diag.config.height == 'auto'){
								var ch = _winSize(frm.contentWindow).sh;
								var _gaps = diag._mainGaps;
								// 总高度 = 内页高度 + 外围
								ch = ch + _gaps.v_gap + _gaps.v_fill;
								diag.size(diag.config.width, ch).resetPosition();
							}
				
						} catch(e) {
							diag._unauthorized = true;
						}
						
						try {
							_isFunc(diag.config.onLoad) && diag.config.onLoad.call(diag);
						} catch(e){}

						frm = null;
			   };
			   
			})(this);
			
			_EvtUtils.bind($iframe, 'load', _iframeLoad);
			
			return $iframe;
		},

		// 聚焦当前窗口
		focus: function() {
			var dom = this.DOM,
				$mask = this._mask(),
				focusDiag = _topWin._focusedIdlg,
				openerDiag = this.openerDialog,
				zindx = 0;
			
			if(this._childList.length == 0 && this !== focusDiag) {
				zindx = _topWin._idlgzIndex;
				dom.wrap.style.zIndex = zindx;
				this.config.modal && ($mask.style.zIndex = zindx - 1);
				_topWin._idlgzIndex += 2;
			}
			
			this.show();
			
			if(focusDiag && this !== focusDiag) {
				_css.remove(focusDiag.DOM.wrap, 'idlg-focus');
				_css.add(focusDiag.DOM.wrap, 'idlg-blur');
				focusDiag._toggleSelfMaskStyle(false);
				focusDiag.DOM.iframeCover && (focusDiag.DOM.iframeCover.style.display = 'block');
			}

			if(dom.iframeCover) {
				dom.iframeCover.style.display = 'none';
			}

			if(openerDiag && openerDiag.DOM.iframeCover) {
				openerDiag.DOM.iframeCover.style.display = 'none';
			}

			_css.remove(dom.wrap, 'idlg-blur');
			_css.add(dom.wrap, 'idlg-focus');
			this._toggleSelfMaskStyle(true);
			_topWin._focusedIdlg = this;
		},
		
		// 锁屏
		_lock: function() {
			this._mask().style.display = 'block';
			var ws = _winSize(this.context);
			if(ws.sh > ws.ch && this.config.fixed) { // has scrollbar
				_css.add(this._contextDoc.documentElement, 'idlg-lock');
			}
		},
		_unlock: function() {
			this._mask().style.display = 'none';
			this._mask().className = 'idlg-mask';
			_css.remove(this._contextDoc.documentElement, 'idlg-lock');
		},
		_toggleSelfMaskStyle: function(add) {
			// 支持临时性的遮罩层样式
			if(typeof this.config.modal !== 'string') {
				return;
			}
			
			add ? _css.add(this._mask(), this.config.modal) 
					: _css.remove(this._mask(), this.config.modal);
		},
		// 创建遮罩层
		_mask: function() {
			var _doc = this._contextDoc, 
					$mask = _doc.getElementById('_idlg_mask_');
				
			if($mask) {
				return $mask;
			}
			
			$mask = _doc.createElement('div');
			$mask.id = '_idlg_mask_';
			$mask.style.cssText = 'position:' + (_isIE6 ? 'absolute' : 'fixed') + ';left:0;top:0;right:0;bottom:0;z-index:1;width:100%;height:100%;overflow:hidden;';
			$mask.className = 'idlg-mask';
			
			if(_isIE6) {
				$mask.style.width = _winSize(this.context).sw + 'px';
				$mask.style.height = _winSize(this.context).sh + 'px';
			}
			
			_doc.body.appendChild($mask);

			if(this.config.fixed) {
				var sbarw = _scrollSize(this._contextDoc);
				_innerHTML($mask, '<style type="text/css">.idlg-lock body {border-right:'+ sbarw +'px solid transparent;}</style>', this.context);
			}
			
			$mask.onclick = function() {
				if(_topWin._focusedIdlg 
					&& _topWin._focusedIdlg.config.quickClosable === true) {
					_topWin._focusedIdlg.close();
				}
			};
			
			return $mask;
		},
		
		// 初始化窗口相关事件
		_addEvent: function() {
			var _this = this, 
				cfg = this.config,
				dom = this.DOM, 
				$wrap = dom.wrap, 
				_clickHandler,
				_mdownHandler;
			
			!this._eventCache && (this._eventCache = []);
			
			_clickHandler = _EvtUtils.add($wrap, 'click', function(evt) {
				var target = evt.srcElement || evt.target;
				
				// 有效的点击：idlg-min, idlg-max, idlg-close, idlg-btn
				while(!_css.has(target, 'idlg-min') && !_css.has(target, 'idlg-max')
							&& !_css.has(target, 'idlg-close') && !_css.has(target, 'idlg-btn')
							&& !_css.has(target, 'idlg')) {
						target = target.parentNode;
				}
				
				if(_css.has(target, 'idlg') || target.disabled) {
					return;
				}
				
				// close
				if(target === dom.close) {
					return !_isFunc(cfg.closeEvent) || cfg.closeEvent.call(_this) !== false 
									? _this.close() : _this;
				}
				// max
				else if(target === dom.max) {
					_this.maximize();
				}
				// min
				else if(target === dom.min) {
					_this.minimize();
				} 
				// dialog btns
				else if(_css.has(target, 'idlg-btn')) {
					var fn = _this._listeners[target.id] && _this._listeners[target.id].callback;
					return (typeof fn !== 'function' || fn.call(_this) !== false) 
								? _this.close() : _this;
				}
			});
			
			_mdownHandler = _EvtUtils.add($wrap, 'mousedown', function(evt) {
				_this.focus();	
			});
      
      //双击header最大化窗体
      if(cfg.maxable) {
        dom.header.ondblclick = function() {
          _this.maximize();
        };
      }
			
			this._eventCache.push(_clickHandler);
			this._eventCache.push(_mdownHandler);
		},
		
		// 清除窗口上注册的所有事件
		_removeEvent: function() {
			var _eventCache = this._eventCache;
			if(_eventCache && _eventCache.length > 0) {
				for(var i = _eventCache.length - 1; i >= 0 ; i--) {
					_EvtUtils.remove(_eventCache[i]);
				}
				
				this._eventCache = _eventCache = [];
			}
			
			if(this.DOM.iframe) {
				_EvtUtils.unbind(this.DOM.iframe, 'load', this.iframeLoad);
			}
		},
		
		// ------------------------ public method -----------------------------
		
		/**
		 * 设置或获取Dialog标题内容
		 * @param _title 新标题内容，可选
		 * @return 如果无参数，则返回Dialog标题内容；如果有参数，则返回当前Dialog对象本身
		 */
		title: function(_title) {
			var $title = this.DOM.title;
			
			if(_title === undefined) {
				return $title.innerHTML;
			}
			
			if(_title === false || _title === null) {
				$title.parentNode.style.display = 'none';
				return this;
			}
			
			if(typeof _title === 'string') {
				$title.parentNode.style.display = 'block';
				_innerHTML($title, _title, this.context);
				return this;
			} 
			
			if(_isFunc(_title)) {
				// 支持异步更新标题
				var asyncTitle = _title.call(this, (function(diag){ 
												return function(newTitle){
													diag.title(newTitle);
											 	};
									 		})(this));
				
				if(asyncTitle && typeof asyncTitle === 'string') {
					this.title(asyncTitle);
				};
			}
			return this;
		},
		
		/**
		 * 设置或获取Dialog显示的url地址
		 * @param _url {String}，可选
		 * @return 如果无参数，则返回当前的url地址；否则，加载给定的url。
		 */
		url: function(_url) {
			if(_url === undefined) {
				return this.config.url;
			}
			
			this.DOM.iframe && (this.DOM.iframe.src = _url);
			
			return this;
		},
		
		/**
		 * 设置或获取Dialog显示的内容
		 * @param _content {String, HTMLElement, Function}，可选
		 * @return 如果无参数且内容是url加载生成的，则返回url对应页面的window对象(非跨域下)；
		 * 		如果无参数且内容是静态内容，则返回静态内容本身；
		 * 		如果有参数，则返回当前Dialog对象本身
		 */
		content: function(_content) {
			if(_content === undefined) {
				if(this.config.url) {
					return this.innerWindow;
				}
				
				return this.config.content;
			}
			
			var _this = this, prev, next, pNode, display, asyncContent, 
				$content = this.DOM.main;
			
			_css.remove($content, 'scroll');
			
			if(this._elemBack) {
				this._elemBack();
				delete this._elemBack;
			}

			if(typeof _content === 'string') {
				_innerHTML($content, _content, this.context);
			} 
			else if(_isFunc(_content)) {
				// 支持异步更新内容
				asyncContent = _content.call(this, (function(diag){ 
													return function(newStr){
														diag.content(newStr);
												 	};
									 			})(this)
									 	);
				
				if(asyncContent && typeof asyncContent === 'string') {
					_innerHTML($content, asyncContent, this.context);
				};
			}
			// HTMLElement
			else if(_content && _content.nodeType === 1) {
				// 让传入的元素在窗口关闭后可以恢复到原来的地方
				display = _content.style.display;
				prev = _content.previousSibling;
				next = _content.nextSibling;
				pNode = _content.parentNode;
				
				this._elemBack = function() {
					if(prev && prev.parentNode) {
						prev.parentNode.insertBefore(_content, prev.nextSibling);
					} else if(next && next.parentNode) {
						next.parentNode.insertBefore(_content, next);
					} else if(pNode) {
						pNode.appendChild(_content);
					}
					_content.style.display = display;
					_this.elemBack = null;
				};
				
				$content.innerHTML = '';
				//$content.appendChild(_content);
				_innerHTML($content, _content.outerHTML, this.context);
				_content.style.display = 'block';
			}
			
			if(this.config.height == 'auto') {
				this.size(this.config.width, this.config.height);
			}
			
			this.resetPosition();
			
			return this;
		},
		
		/**
		 * 改变Dialog窗口大小
		 * @param w 窗口宽度
		 * @param h 窗口高度
		 * @return 当前Dialog对象本身
		 */
		size: function(w, h) {
			var _w = w, _h = h, iw = 'auto', ih = 'auto';
			
			var dom = this.DOM, _gaps = this._mainGaps, ws = _winSize(this.context);
		
			// 计算百分数
			var pReg = /^\d+(\.\d+)?%$/;
			if(pReg.test(_w)) {
				_w = ws.cw * parseFloat(_w) * 0.01;
			} else if(/^\d+/.test(_w)) {
				_w = _int(_w, 0);
			} else {
				if(dom.main.offsetWidth + _gaps.h_gap > ws.cw) {
					_w = ws.cw;
					_css.add(dom.main, 'scroll');
				}
			}
			
			if(pReg.test(_h)) {
				_h = ws.ch * parseFloat(_h) * 0.01;
			} else if(/^\d+/.test(_h)) {
				_h = _int(_h, 0);
			} else {
				if(dom.main.offsetHeight + _gaps.v_gap > ws.ch) {
					_h = ws.ch;
					_css.add(dom.main, 'scroll');
				}
			}
	
			// 计算内容区域的宽度和高度
			if(!isNaN(_w)) {
				_w = Math.min(_int(_w, 0), ws.cw);
				iw = (_w - _gaps.h_gap - _gaps.h_fill) + 'px';
				dom.wrap.style.width = _w + 'px';
			}

			if(!isNaN(_h)) {
				_h = Math.min(_int(_h, 0), ws.ch);
				ih = (_h - _gaps.v_gap - _gaps.v_fill) + 'px';
			}
			
			dom.main.style.width = iw;
			dom.main.style.height = ih;
			
			if(dom.iframe) {
				dom.iframe.style.width = iw;
				dom.iframe.style.height = ih;
			}
			
			this.config.width = w;
			this.config.height = h;
			
			return this;
		},
		
		/**
		 * 窗口显示位置
		 */
		position: function(_left, _top) {
			var reg = /^\d+(\.\d+)?%$/,
				cfg = this.config,
				$wrap = this.DOM.wrap,
				_fixed = cfg.fixed,
				ws = _winSize(this.context),
				dl = _fixed ? 0 : ws.sl,
				dt = _fixed ? 0 : ws.st;
      
			_left = _left === undefined ? cfg.left : _left;
			_top = _top === undefined ? cfg.top : _top;
			
			cfg.left = _left;
			cfg.top = _top;
			
			if (reg.test(_left)) {
	      _left = (ws.cw - $wrap.offsetWidth) * parseFloat(_left) * 0.01 + dl;
				_left = Math.max(parseInt(_left), dl);
	    }
		
	    if(reg.test(_top)) {
				_top = (ws.ch - $wrap.offsetHeight) * parseFloat(_top) * 0.01 + dt;
				_top = Math.max(parseInt(_top), dt);
	    }

	    $wrap.style.left = _left + 'px';
	    $wrap.style.top = _top + 'px';
			
			return this;
		},
		
		/**
		 * 重新调整当前窗口的显示位置
		 */
		resetPosition: function () {
      // 如果窗口已经最最大化了
      if(this._maximized) {
        this.position(0, 0);
        this.size(99999, 99999);
        return this;
      }
      
			var _follow = this.config.follow || this._follow;
			_follow && _follow['target'] ? this.follow(_follow['target'], _follow['placement']) : this.position();
      
      return this;
		},
		
		/**
		 * 显示当前Dialog窗口
		 * 和 hide() 方法配合使用
		 */
		show: function() {
			this.DOM.wrap.style.display = 'block';
			_css.add(this.DOM.wrap, 'idlg-show');
			this.DOM.wrap.focus();
			return this;
		},
		
		/**
		 * 隐藏当前Dialog窗口
		 * 和 close() 区别是：hide() 是暂时不显示
		 */
		hide: function() {
			this.DOM.wrap.style.display = 'none';
			_css.remove(this.DOM.wrap, 'idlg-show');
			return this;
		},
		
		/**
		 * 跟随元素
		 * @param {HTMLElement}, placement = top|bottom|left|right
		 */
		follow: function (elem, placement) {
			// 隐藏元素不可用
			if (!elem || !elem.offsetWidth && !elem.offsetHeight) {
				return this.position();
			};
			
			this.config.dragable = false;
			this.config.resizable = false;
			
			placement = (/^\s*(top|bottom|left|right)\s*$/gi.test(placement) ? placement : 'bottom').toLowerCase();

			var fixed = false,
				dom = this.DOM,
				ws = _winSize(this.context),
				winWidth = ws.cw,
				winHeight = ws.ch,
				docLeft =  ws.sl,
				docTop = ws.st,
				
				offset = _offset(elem),
				elemWidth = elem.offsetWidth,
				elemHeight = elem.offsetHeight,
				
				left = fixed ? offset.left - docLeft : offset.left,
				top = fixed ? offset.top - docTop : offset.top,
				
				wrapWidth = dom.wrap.offsetWidth,
				wrapHeight = dom.wrap.offsetHeight,
				
				setLeft = 0,
				setTop = 0,
				
				dl = fixed ? 0 : docLeft,
				dt = fixed ? 0 : docTop;

			dom.arw.style.display = 'block';
			var arrLeft = 10, arrTop = 10, 
				arrType = '';
			
			if('left' == placement || 'right' == placement) {
				dom.arw.className = 'idlg-arw at-lft';
				var arrW = dom.arw.offsetWidth, arrH = dom.arw.offsetHeight;
				var _lft = left + dl - (wrapWidth + arrW), 
						_rgt = (left + elemWidth) + arrW;
					
				setTop = Math.max(dt, top + elemHeight/2 - wrapHeight/2);
				if(setTop + wrapHeight > winHeight + dt) {
					setTop = winHeight + dt - wrapHeight;
				}
				arrTop = top + elemHeight/2 - setTop;
				//修正arrTop的值，不能超出当前Dialog的范围
				if(arrTop <= arrH * 0.5) { arrTop = arrH * 0.5 + 4; }
				if(arrTop + arrH >= wrapHeight) { arrTop = wrapHeight - arrH - 4; }
					
				switch(placement) {
					case 'left':
						setLeft = _lft;
						arrType = 'rgt';
						if(_rgt + wrapWidth <= winWidth) {
							setLeft = _rgt;
							arrType = 'lft';
						}
					break;
					case 'right':
						setLeft = _rgt;
						arrType = 'lft';
						if(_rgt + wrapWidth > winWidth && _lft >= 0) {
							setLeft = _lft;
							arrType = 'rgt';
						}
					break;
				};
				
				dom.arw.className = 'idlg-arw at-'+ arrType;
				dom.arw.style.top = parseInt(arrTop - arrH * 0.5) + 'px';
			} else {
				dom.arw.className = 'idlg-arw at-top';
				var arrW = dom.arw.offsetWidth, arrH = dom.arw.offsetHeight;
				setLeft = left - (wrapWidth - elemWidth) * 0.5;
				if(setLeft < dl) {
					setLeft = left;
					arrLeft = elemWidth * 0.5;
				} else if((setLeft + wrapWidth > winWidth) && (left - wrapWidth > dl)) {
					setLeft = left + elemWidth - wrapWidth;	
					arrLeft = wrapWidth - elemWidth * 0.5;
				} else {
					setLeft = setLeft;
					arrLeft = wrapWidth * 0.5;
				}
				//修正 arrLeft 的值，不能超出当前Dialog的范围
				if(arrLeft <= arrW * 0.5) { arrLeft = arrW * 0.5 + 4; }
				if(arrLeft + arrW >= wrapWidth) { arrLeft = wrapWidth - arrW - 4; }
				
				switch(placement) {
					case 'top':
						setTop = top - wrapHeight - arrH;
						arrType = 'btm';
						if(setTop - dt < 0) {
							setTop = top + elemHeight + arrH;
							arrType = 'top';
						}
					break;
					case 'bottom':
						setTop = top + elemHeight + arrH;
						arrType = 'top';
						if((setTop + wrapHeight > winHeight + dt) && (top - wrapHeight > dt)) {
							setTop = top - wrapHeight - arrH;
							arrType = 'btm';
						}
					break;
				};
				
				dom.arw.className = 'idlg-arw at-'+ arrType;
				dom.arw.style.left = parseInt(arrLeft - arrW * 0.5) + 'px';
			}		

			dom.wrap.style.position = 'absolute';
			dom.wrap.style.left = parseInt(setLeft) + 'px';
			dom.wrap.style.top = parseInt(setTop) + 'px';
			
			this._follow = {'target': elem, 'placement': placement};
		
			return this;
		},
		
		/**
		 * 创建按钮
		 * @example button({
		 * id: '',
		 * label: 'login',
		 * click: function () {},
		 * disabled: false,
		 * focus: true,
		 * intent: 'primary|success|warning|danger'
		 * }, .., ..)
		 */
		button: function() {
			var args = [].slice.call(arguments);
		
			if(args.length == 0) {
				return;
			}
			
			var doc = this._contextDoc,
				docfrag = doc.createDocumentFragment(),
				dom = this.DOM,
				listeners = this._listeners = this._listeners || {},
				i = args.length - 1, arg, id, isNewBtn, btn;	
			
			for(; i >= 0; i--) {
				arg = args[i];
				id = arg.id || 'idlg_btn_'+ (+ new Date()) + '_' + i;
				isNewBtn = !listeners[id];
		
				btn = !isNewBtn ? listeners[id].elem : doc.createElement('a');
				btn.setAttribute('href', 'javascript:;');
				btn.id = id;
				
				if(btn.disabled) {
					btn.className = 'idlg-btn idlg-btn-dis';
				} else {
					btn.className = ('idlg-btn '+ (arg.intent?(' idlg-btn-intent-'+ arg.intent):'') + (arg.focus?' idlg-btn-focus':'') );
				}
				
				btn.innerHTML = ('<span class="idlg-btn-txt">'+ arg.label + '</span>');
				btn.disabled = !!arg.disabled;

				if(!listeners[id]) {
					listeners[id] = {};
				}
				
				if(arg.click) {
					listeners[id].callback = arg.click;
				}
				
				if(isNewBtn) {
					listeners[id].elem = btn;
					docfrag.appendChild(btn);
				}
			}
			
			dom.btns.appendChild(docfrag);
			dom.footer.style.display = 'block';
			docfrag = null;
			
			return this;
		},
		
		/**
		 * 关闭当前Dialog窗口对象
		 */
		close: function() {
			
			if(this._closed) {
				return;
			}
			
			// 从窗口管理器中移除当前窗口对象
			removeDiag(_topWin['_idlg_list_'], this);
			
			var cfg = this.config, 
				hideMask = true, 
				$mask = this._mask(), 
				leftDiags = _topWin['_idlg_list_'],
				$wrap = null;
			
		    /*if(this._unauthorized === false) {
			  	if(this.innerWindow && this.innerWindow.Dialog && 
			  			this.innerWindow.Dialog._childList.length > 0) {
			  		return;
			  	}
				}*/
			
			// 移除临时性的遮罩层样式
			this._toggleSelfMaskStyle(false);

			// 先关闭可能存在的所有子窗口
			for(var i = 0, len = this._childList.length; i < len; i++) {
				this._childList.shift().close();
			}
			
			// 如果定义了窗口关闭后要执行的事件
	    if(_isFunc(cfg.onClosed)) {
	    	cfg.onClosed.call(this);
	    }
		
			// 将遮罩层交给后面一个需要的窗口
			for(var i = 0, len = leftDiags.length; i < len; i++) {
				var dlg = leftDiags[i];
				if(dlg.config.modal) {
					dlg._toggleSelfMaskStyle(true);
					$mask.style.zIndex = _int(dlg.DOM.wrap.style.zIndex, 1) - 1;
					hideMask = false;
					break;
				}
			}
			// 如果没有dialog需要mask的，则隐藏mask
		  hideMask && this._unlock();
			
			// 将窗口管理中下一个窗口激活为当前顶层窗口
			_topWin._focusedIdlg = leftDiags.length > 0 ? leftDiags[0] : null;
			_topWin._focusedIdlg && _topWin._focusedIdlg.focus();

			this._closed = true;
		    
			$wrap = this.DOM.wrap;
			$wrap.style.display = 'none';
			
			this._removeEvent();
			
			if(this._elemBack) {
			   this._elemBack();
			}
			
			if(this._listeners) {
				for(var j in this._listeners) {
					this._listeners[j] = null;
					delete this._listeners[j];
				}
				this._listeners = null;
			}
			
			/* 对于iframe，这样的额外处理并不会进行垃圾回收
			if(cfg.url) {
				this.DOM.iframe.src = 'about:blank';
				this.DOM.iframe.parentNode.innerHTML = '&nbsp;';
			}*/
      
      if(cfg.maxable) {
        this.DOM.header.ondblclick = null; 
      }
			
			for(var d in this.DOM){
				this.DOM[d] = null;
				delete this.DOM[d];
			}
			
			this.DOM = null;
			this.context = null;
			this.openerWindow  = null;
			this.openerDialog  = null;
			if(this.innerWindow) {
				this.innerWindow.ownerDialog && (this.innerWindow.ownerDialog = null);
				this.innerWindow = null;
			}
			//this.innerDocument = null;
			this._contextDoc = null;
			this._container = null;
			this._childList = [];
			this.htmlElement = null;

			$wrap.parentNode.removeChild($wrap);
			
			cfg = hideMask = $mask = leftDiags = $wrap = null;
			
			// IE下强制执行垃圾回收
		  doc.all && CollectGarbage();
		},
		
		/**
		 * 最大化窗口
		 */
		maximize: function() {
			if(!this.config.maxable) {
				return this;
			}
			
			if(_isFunc(this.config.maximizeEvent) 
				&& this.config.maximizeEvent.call(this) === false) {
				return this;
			}
			
			var cfg = this.config, 
				$wrap = this.DOM.wrap;
			// 还原窗口
			if(this._maximized === true) {
				this._maximized = false;
				this.size(this._ow, this._oh).position(this._olft, this._otop);
				this.DOM.max.className = 'idlg-max';
				_css.remove(this.DOM.wrap, 'idlg-maxed');
			} else {
				this._maximized = true;
				this._ow = cfg.width;
				this._oh = cfg.height;
				this._olft = _int($wrap.style.left, 0);
				this._otop = _int($wrap.style.top, 0);
				$wrap.style.left = 0;
				$wrap.style.top = 0;
				this.size(99999, 99999);
				this.DOM.max.className = 'idlg-max idlg-restore';
				_css.add(this.DOM.wrap, 'idlg-maxed');
			}
			
			return this;
		},
		
		/**
		 * 最小化窗口
		 */
		minimize: function() {			
			if(!this.config.minable) {
				return this;
			}
			
			if(_isFunc(this.config.minimizeEvent)
				&& this.config.minimizeEvent.call(this) === false) {
				return this;
			}
			
			var dom = this.DOM;
			if(this._minimized === true) {
				this._minimized = false;
				dom.main.style.display = 'block';
				dom.footer.style.display = 'block';
				_css.remove(this.DOM.wrap, 'idlg-mined');
			} else {
				this._minimized = true;
				dom.main.style.display = 'none';
				dom.footer.style.display = 'none';
				_css.add(this.DOM.wrap, 'idlg-mined');
			}

			return this;
		}
		
	};
	
	
	Dialog.fn.constructor.prototype = Dialog.fn;
	
	_topWin['_idlg_list_'] = _topWin['_idlg_list_'] || [];
	_topWin._focusedIdlg = _topWin._focusedIdlg || null;
	_topWin._idlgzIndex = _topWin._idlgzIndex || 9999;
	
	function removeDiag(arr, diag) {
		for(var i = 0, len = arr.length; i < len; i++) {
			if( diag == arr[i] ){
				arr[i] = null;
				arr.splice(i, 1);
				break;
			}
		}
	}

	//----------------------------------------------------------------------------
	// Dialog对话框 拖曳(drag, resize)支持 (可选外部模块)
	//----------------------------------------------------------------------------
	var _dragEvent = null, _dragInit = null, 
		_isLosecapture = 'onlosecapture' in doc.documentElement,
		_isSetCapture = 'setCapture' in doc.documentElement;
	
	Dialog._dragEvent = function() {
		var that = this,
				proxy = function(name) {
					var fn = that[name];
					that[name] = function() {
						return fn.apply(that, arguments);
					};
				};
		
		proxy('start');
		proxy('move');
		proxy('end');
	};
	
	Dialog._dragEvent.prototype = {
		onstart: function(){},
		start: function(evt) {
			this._sClientX = evt.pageX;
			this._sClientY = evt.pageY;
			_EvtUtils.bind(doc, 'mousemove', this.move);
			_EvtUtils.bind(doc, 'mouseup', this.end);
			this.onstart(this._sClientX, this._sClientY);
			return false;
		},
		
		onmove: function(){},
		move: function(evt) {
			evt = _EvtUtils.fix(evt);
			this.onmove(evt.pageX - this._sClientX, evt.pageY - this._sClientY);
			return false;
		},
		
		onend: function(){},
		end: function(evt) {
			evt = _EvtUtils.fix(evt);
			_EvtUtils.unbind(doc, 'mousemove', this.move);
			_EvtUtils.unbind(doc, 'mouseup', this.end);
			this.onend(evt.pageX, evt.pageY);
			return false;
		}
	};
	
	// Dialog drag init
	_dragInit = function(evt) {
		var diag = root._focusedIdlg,
			dom = diag.DOM,
			$wrap = dom.wrap,
			wrapStyle = $wrap.style,
			$title = dom.title,
			$cover = dom.iframeCover,
			target = evt.srcElement || evt.target, 
			targetCls = target.className;
		
		var _isResize = (targetCls && /(\s+|^)idlg-(s|n|w|e|nw|ne|sw|se)(\s+|$)/.test(targetCls));
		var startWidth = 0, startHeight = 0, startLeft = 0, startTop = 0, limit = {};
		
		_dragEvent.onstart = function(x, y) {
			if(_isResize) {
				startWidth = $wrap.offsetWidth;
				startHeight = $wrap.offsetHeight;
			}
			
			startLeft = _int(wrapStyle.left, 0);
			startTop = _int(wrapStyle.top, 0);
			
			!_isIE6 && (_isLosecapture ? _EvtUtils.bind($title, 'losecapture', _dragEvent.end) 
									 : _EvtUtils.bind(root, 'blur', _dragEvent.end));
			
			_isSetCapture && $title.setCapture();
			
			$cover && ($cover.style.display = 'block');
		};
		
		_dragEvent.onmove = function(x, y) {
			if(_isResize) {
				var pos = {"width": startWidth, "height": startHeight, 
							"left": _int(wrapStyle.left, 0), "top": _int(wrapStyle.top, 0)};

				if(targetCls.indexOf("e") != -1) {
					pos.width = Math.max(Dialog.defaults._resize.minWidth, startWidth + x);
				}
				if(targetCls.indexOf("s") != -1) {
					pos.height = Math.max(Dialog.defaults._resize.minHeight, startHeight + y);
				}
				if(targetCls.indexOf("w") != -1) {
					pos.width = Math.max(Dialog.defaults._resize.minWidth, startWidth - x);
					pos.left = Math.max(0, startLeft + startWidth - pos.width);
				}	
				if(targetCls.indexOf("n") != -1) {
					pos.height = Math.max(Dialog.defaults._resize.minHeight, startHeight - y);
					pos.top = Math.max(0, startTop + startHeight - pos.height);
				}
				
				wrapStyle.left = pos.left +'px';
				wrapStyle.top = pos.top +'px';
				
				diag.size(pos.width, pos.height);
				
				if(_isFunc(diag.config.onResize)) {
					diag.config.onResize.call(this, pos);
				}
				
			} else {
				var	nLeft = Math.max(limit.minX, Math.min(limit.maxX, x + startLeft)),
						nTop = Math.max(limit.minY, Math.min(limit.maxY, y + startTop));
				
				wrapStyle.left = nLeft + 'px';
				wrapStyle.top = nTop + 'px';
				
				if(_isFunc(diag.config.onDrag)) {
					diag.config.onDrag.call(this, {'left': nLeft, 'top': nTop});
				}
			}
		};
		
		_dragEvent.onend = function(x, y) {
			diag.config.left = _int(wrapStyle.left, 0);
			diag.config.top = _int(wrapStyle.top, 0);
			$cover && ($cover.style.display = 'none');
			
			!_isIE6 && _isLosecapture 
					? _EvtUtils.unbind($title, 'losecapture', _dragEvent.end)
					: _EvtUtils.unbind(root, 'blur', _dragEvent.end);
					
			_isSetCapture && $title.releaseCapture();
		};
		
		limit = (function() {
			var ws = _winSize(diag.context),
				maxX = 0, maxY = 0,
				fixed = ($wrap.style.position === 'fixed'),
				ow = $wrap.offsetWidth,
				oh = $wrap.offsetHeight,
				ww = ws.cw,
				wh = ws.ch,
				dl = fixed ? 0 : ws.sl,
				dt = fixed ? 0 : ws.st;
			
			// 坐标最大限制
			maxX = ww - ow + dl;
			maxY = wh - oh + dt;
			
			return {
				"minX": dl,
				"minY": dt,
				"maxX": maxX,
				"maxY": maxY,
				"sl": ws.scrollLeft,
				"st": ws.scrollTop
			};
		})();
		
		_dragEvent.start(evt);
	};
	
	function _dragHandler(evt) {
		var dlg = root._focusedIdlg;
		if(!dlg) {
			return false;
		}
		
		if(!dlg.config.dragable && !dlg.config.resizable || dlg._maximized) {
			return false;
		}
		
		var _evt = _EvtUtils.fix(evt), target = _evt.target;
		
		while(target) {
			if(target.className && /(\s+|^)idlg-(header|s|n|w|e|nw|ne|sw|se)(\s+|$)/.test(target.className)) {
				break;
			}
			if(target === dlg.DOM.wrap || (target.nodeType === 1 && target.tagName === 'BODY')) {
				target = null;
				break;
			}
			target = target.parentNode;
		};
		
		if(target) {
			_dragEvent = _dragEvent || new Dialog._dragEvent();
			_dragInit(_evt);
			_EvtUtils.stop(evt);
			// 防止firefox与chrome滚屏
			return false; 
		};
	};
	
	// 代理 mousedown 事件触发对话框拖动
	_EvtUtils.unbind(document, 'mousedown', _dragHandler);
	_EvtUtils.bind(document, 'mousedown', _dragHandler);
	
	//---------------------------------- drag end -------------------------------
	
	
	//------------------------------------------------------------
	// 静态方法
	//------------------------------------------------------------
	
	/**
	 * 打开一个新窗口
	 * @return 返回新打开的窗口对象
	 */
	Dialog.open = function(config) {
		var dlg = Dialog(config);
		return dlg;
	};
	
	/**
	 * 根据窗口唯一标识ID获取窗口Dialog对象
	 * @param id 窗口唯一标识ID
	 * @return 如果id为空，则返回当前活动的窗口Dialog对象；否则返回指定ID的窗口Dialog对象
	 */
	Dialog.get = function(id, win) {
		if(id === undefined) {
			return _topWin._focusedIdlg;
		}
		
		for(var i = 0, len = _topWin['_idlg_list_'].length; i < len; i++) {
			if(_topWin['_idlg_list_'][i].id === id) {
				return _topWin['_idlg_list_'][i];
			}
		}
		
		return null;
	};	
	
	/**
	 * 用于窗口内子页面获取当前所在窗口的触发来源页面window对象
	 * 即：当前窗口是从哪个页面上弹出来的
	 * @return 触发页面的window对象
	 */
	Dialog.openerWindow = function() {
		return root.ownerDialog ? root.ownerDialog.openerWindow : null;
	};
	
	/**
	 * 用于窗口内子页面获取当前所在窗口的父窗口Dialog对象
	 * 即：当前窗口是从哪个Dialog窗口中弹出来的
	 * @return 触发窗口的Dialog对象
	 */
	Dialog.openerDialog = function() {
		var op_win = Dialog.openerWindow();
		if( op_win && op_win.ownerDialog ){
			return op_win.ownerDialog;
		}else{
			return null;
		};
	};
	
	/**
	 * 用于窗口内子页面获取当前所在窗口Dialog对象
	 * @return 当前所在窗口的Dialog对象
	 */
	Dialog.ownerDialog = function() {
		console.log(window.ownerDialog);
		return root.ownerDialog || null;
	};
	
	/**
	 * 关闭窗口
	 * @param id 窗口唯一标识ID，如果参数为空，则关闭当前活动的窗口；否则关闭ID指定的窗口
	 */
	Dialog.close = function(id, win) {
		if(id === undefined) {
			root.ownerDialog.close();
		} 
		else if(Dialog.get(id, win)){
			Dialog.get(id, win).close();
		}
	};
	
	/** 
	 * alert 提示框
	 * @param msg 提示内容，支持html元素
	 * @param okFunc 点击“确定”后执行的回调函数，可选
	 * @param config  提示框的特性设定，支持：title, width, dragable, yesLabel, type(info, warning, success, error)
	 */
	Dialog.alert = function(msg, okFunc, config) {
		var cfg = config || {};
		var icon_type = cfg.alertIcon || ('icon-'+ (cfg.type || 'info'));
		var btns = [{label: cfg.yesLabel || Dialog.defaults.alert.yesLabel, focus: true, intent: cfg.yesStyle||'primary', click: okFunc}];
		var title = cfg.title || Dialog.defaults.alert.title;
		
		cfg.title =  false;
		cfg.width = cfg.width || 'auto';
		cfg.height = cfg.height || 'auto';
		cfg.url = false;
		cfg.closable = false;
		cfg.resizable = false;
		cfg.maxable = false;
		cfg.minable = false;
		cfg.modal = true;
		cfg.theme = 'idlg-alert ' + (cfg.theme || '');
		cfg.content = '<div class="alert-wrapper">'
										+'<div class="alert-icon '+ icon_type +'"></div>'
										+'<div class="alert-content">'
											+(title ? ('<div class="alert-title">'+ title +'</div>') : '')
											+'<div class="alert-msg">'+ msg +'</div>'
										+'</div>'
									+'</div>';
		
		cfg.button = btns.concat(cfg.button || []);
		
		return Dialog.open(cfg);
	};
	
	/**
	 * confirm 确认框
	 * @param content 提示内容，支持html元素
	 * @param yesFunc 点击“是”后执行的回调函数，可选
	 * @param noFunc 点击“否”后执行的回调函数，可选
	 * @config 提示框特性设置项，支持：width, height, title, yesLabel, noLabel, showCancel, follow 
	 */
	Dialog.confirm = function(content, yesFunc, noFunc, config) {
		var cfg = config || {};
		cfg.type = cfg.type || 'warning'; 
		cfg.title = cfg.title || Dialog.defaults.confirm.title;
		cfg.yesLabel = cfg.yesLabel || Dialog.defaults.confirm.yesLabel;

		var btns = [{label: cfg.noLabel || Dialog.defaults.confirm.noLabel, intent: cfg.noStyle||false, click: noFunc }];
		cfg.button = btns.concat(cfg.button || []);
		
		return Dialog.alert(content, yesFunc, cfg);
	};
	
	Dialog.success = function(content, okFunc, config) {
		config = config || {};
		config.type = 'success';
		config.title = config.title || '成功';
		config.yesStyle = config.yesStyle || 'success';

		return Dialog.alert(content, okFunc, config);
	};
	
	Dialog.warning = function(content, okFunc, config) {
		config = config || {};
		config.type = 'warning';
		config.title = config.title || '警告';
		config.yesStyle = config.yesStyle || 'warning';

		return Dialog.alert(content, okFunc, config);
	};
	
	Dialog.error = function(content, okFunc, config) {
		config = config || {};
		config.type = 'error';
		config.title = config.title || '错误';
		config.yesStyle = config.yesStyle || 'danger';

		return Dialog.alert(content, okFunc, config);
	};

	/**
	 * Toaster 通知提示
	 */
	function Toaster(msg, opts, container) {
		var _opts = this.opts = opts || {};
		//指定Toast显示的容器
		this.container = container || document.body;
		//消息内容
		this.msg = msg || '';
		//设定自动关闭的超时时间，如果 <=0 则禁用自动关闭功能
		this.timeout = isNaN(_opts.timeout) ? Toaster.defaults.timeout : parseInt(_opts.timeout);
		//是否自动聚焦，如果自动聚焦，则自动关闭功能会暂时取消，当失去焦点时，自动关闭功能重新开启
		this.autoFocus = typeof _opts.autoFocus === 'undefined' ? Toaster.defaults.autoFocus : _opts.autoFocus;
		//当Toast关闭后，执行的回调函数
		this.onDismiss = typeof _opts.onDismiss === 'function' ? _opts.onDismiss : function() {};
		
		//自定关闭定时器
		this._timer = null;
		//标识关闭是否已经开始
		this._closed = false;
		//相关DOM对象，便于后续操作
		this._eles = {};

		if('loading' == _opts.intent) {
			this.timeout = 0;
		}

		this._create();
	};

	Toaster.prototype._create = function() {
		if(this._eles.$ele) {
			return;
		}

		var _opts = this.opts;
		var ele = this._eles.$ele = document.createElement('div');
		ele.className = 'idlg-toast'+ (_opts.intent ? ' idlg-toast-intent-'+ _opts.intent : '');
		ele.innerHTML = '<span class="idlg-toast-icon '+ (_opts.iconClass||'') +'"></span>'+
											'<div class="idlg-toast-btns"><button class="idlg-toast-close" title="点击立刻关闭">×</button></div>'+
											'<div class="idlg-toast-msg"></div>';
		
		this.autoFocus && ele.setAttribute("tabindex", 0);

		ele.onfocus = ele.onmouseenter = (function(_this) {
			return function() {
				_this._cancelTimeout();
			};
		})(this);

		ele.onblur = ele.onmouseleave = (function(_this) {
			return function() {
				_this._startTimeout();
			};
		})(this);

		ele.onclick = (function(_this) {
			return function(evt) {
				var target = (evt||window.event).srcElement || (evt||window.event).target;
				if(_css.has(target, 'idlg-toast-close')) {
					_this.dismiss();
					return;
				}
				//other click target	
			};
		})(this);

		var childEles = ele.getElementsByTagName('*');
		for(var i = 0, len = childEles.length; i < len; i++) {
			var _child = childEles[i], clsName = _child.className;
			if(clsName.indexOf('idlg-toast-msg') != -1) {
				this._eles.$msg = _child;
			} else if(clsName.indexOf('idlg-toast-btns') != -1) {
				this._eles.$btnGroup = _child;
			} /*else if(clsName.indexOf('idlg-toast-icon') != -1) {
				this._eles.$icon = _child;
			}*/
		}

		this.container.insertBefore(ele, this.container.firstChild);
		this.message(this.msg);
		
		if(this.autoFocus) {
			this._eles.$ele.focus();
		} else {
			this._startTimeout();
		}
	};

	Toaster.prototype._startTimeout = function() {
		if(this.timeout <= 0) {
			return;
		}

		(!this._timer) && (this._timer = setTimeout((function(_this) {
			return function() {
				_this.dismiss();
			};
		})(this), this.timeout));
	};

	Toaster.prototype._cancelTimeout = function() {
		if(this._timer) {
			clearTimeout(this._timer);
			this._timer = null;
		}
	};

	/**
	 * 修改Toast内容
	 */
	Toaster.prototype.message = function(msg) {
		this._cancelTimeout();
		this._eles.$msg.innerHTML = msg || '';
		this._startTimeout();
	};

	/**
	 * 关闭Toast
	 */
	Toaster.prototype.dismiss = function() {
		if(this._closed) {
			return;
		}
		
		this._closed = true;

		if(this._timer) {
			clearTimeout(this._timer);
			this._timer = null;
		}

		//销毁并清理内容
		var $ele = this._eles.$ele;
		$ele.onmouseenter = null;
		$ele.onmouseleave = null;
		$ele.onclick = null;
		$ele.onfocus = null;
		$ele.onblur= null;
		$ele.parentNode.removeChild($ele);
		this._eles = {};

		try {
			//执行回调函数
			this.onDismiss();
		} catch(e) {
			console && console.error(e);
		}
	};

	Toaster.defaults = {
		timeout: 5000,
		autoFocus: false
	};

	/**
	 * 静态方法，封装Toaster调用。
	 * @param msg 消息内容
	 * @param opts 配置选项{intent:'primary|success|warning|danger|dark|loading', 
	 * 											timeout: 毫秒,
	 * 											onDismiss: function() {},
	 * 											position: 'top_left|top_center|top_right|bottom_left|bottom_center|bottom_right',
	 * 											iconClass: ''
	 * 										}
	 * @return 返回 Toaster对象，可以调用对象的方法：xxx.message("新消息内容"); xxx.dismiss()--关闭toast。
	 */
	Dialog.toast = function(msg, opts) {
		var container = Dialog.__toastContainer;
		if(!container) {
			container = Dialog.__toastContainer = doc.createElement('div');
			container.className = 'idlg-toast-container';
			doc.body.appendChild(container);
		}

		var _opts = opts || {};
		if(_opts.position) {
			container.className = 'idlg-toast-container '+ String(_opts.position).toLowerCase();
		}
		container.style.display = 'block';

		//组合内置的dimiss处理：如果所有Toast都销毁了，则自动隐藏其所在的容器。
		_opts.onDismiss = (function(container, _onDismiss) {
			return function() {
				// 当没有toast时隐藏容器
				(container.children.length == 0) && (container.style.display = 'none');

				if(_isFunc(_onDismiss)) { 
					try{
						_onDismiss();
					}catch(e){
						console && console.error(e);
					}
				}
			};
		})(container, _opts.onDismiss);

		var toaster = new Toaster(msg, _opts, container);
		return toaster;
	};
	
	//-----------------------------------------------------------------------------------------
	
	// 全局快捷键
	_EvtUtils.bind(document, 'keydown', function (evt) {
		var target = evt.srcElement || evt.target,
			nodeName = target.nodeName,
			rinput = /^input|textarea$/i,
			focusDiag = _topWin._focusedIdlg,
			keyCode = evt.keyCode;
			
		if(!focusDiag || rinput.test(nodeName)) {
			return;
		}
		
		// ESC
		if(keyCode === 27) {
			focusDiag.close();
			return;
		}
		
		// Enter, <-, ->
		if(keyCode !== 13 && keyCode !== 37 && keyCode !== 39) {
			return;
		}
		
		var btns = focusDiag.DOM.btns && focusDiag.DOM.btns.getElementsByTagName('a');
		if(!btns || btns.length == 0) {
			return;
		}
		
		var len = btns.length, focusIndx = -1, prevIndx = -1;
		for(var i = 0; i < len; ++i) {
			if(_css.has(btns[i], 'idlg-btn-focus')){
				focusIndx = i;
				break;
			}
		}
		
		_EvtUtils.stop(evt);
		
		// Enter
		if(keyCode === 13) {
			var btnId = btns[focusIndx].getAttribute('id');
			var fn = focusDiag._listeners[btnId] && focusDiag._listeners[btnId].callback;
			(typeof fn !== 'function' || fn.call(focusDiag) !== false) && focusDiag.close();
		}
		
		// <-- -->
		if((keyCode === 37 || keyCode === 39) && len > 1) {
		
			if(keyCode === 37) {
				if(focusIndx <= 0) {
					focusIndx = len - 1;
					prevIndx = 0;
				} else {
					prevIndx = focusIndx;
					focusIndx = Math.max(--focusIndx, 0);
				}
			}
			else if(keyCode === 39) {
				if(focusIndx < 0) {
					focusIndx = prevIndx = 0;
				} 
				else if(focusIndx == len-1) {
					prevIndx = focusIndx;
					focusIndx = 0;
				} else {
					prevIndx = focusIndx;
					focusIndx = Math.min(++focusIndx, len-1);
				}
			}
			
			if(!btns[focusIndx].disabled) {
				_css.remove(btns[prevIndx], 'idlg-btn-focus');
				_css.add(btns[focusIndx], 'idlg-btn-focus');
				focusDiag.focus();
			}
		}
		
	});
	
	// 浏览器窗口resize后重置对话框位置
	var idlg_rstimer = null;
	_EvtUtils.bind(root, 'resize', function () {
		if(idlg_rstimer) {
			clearTimeout(idlg_rstimer);
			idlg_rstimer = null;
		}

		idlg_rstimer = setTimeout(function() {
			for(var i = 0, len = _topWin['_idlg_list_'].length; i < len; i++) {
				_topWin['_idlg_list_'][i].resetPosition();
			}
			
			if(_isIE6) {
				var $mask = document.getElementById('_idlg_mask_');
				if($mask && $mask.style.display != 'none') {
					var ws = _winSize(root);
					$mask.style.width = ws.sw + 'px';
					$mask.style.height = ws.sh + 'px';
				}
			}
		}, 150);
	});
	

// 模板
Dialog._tmpl = '<div class="idlg-outer" style="position:relative;">{rs_tmpl}'
//+	'<div class="idlg-inner">'
+		'<a href="javascript:void(0);" class="idlg-min" style="display:none;">&nbsp;</a>'
+		'<a href="javascript:void(0);" class="idlg-max" style="display:none;">&nbsp;</a>'
+		'<a href="javascript:void(0);" class="idlg-close" style="display:none;">x</a>'
+		'<div class="idlg-header"><div class="idlg-title"></div></div>'
+		'<div class="idlg-main"></div>'
+		'<div class="idlg-footer" style="display:none;"><div class="idlg-btns"></div></div>'
//+	'</div>'
+	'<span class="idlg-arw" style="display:none;"><i class="arw-out"></i><i class="arw-in"></i></span>'
+'</div>';

Dialog.ifrm_tmpl = '<iframe src="about:blank" class="idlg-iframe" width="100%" height="100%" frameborder="0" scrolling="auto" hidefocus="true" allowtransparency="true"></iframe>'
+'<div class="idlg-iframecover" style="display:none;position:absolute;z-index:2;left:0;top:0;right:0;bottom:0;width:100%;height:100%;background-color:#ffffff;opacity:0;filter:alpha(opacity=0);overflow:hidden;"></div>';

Dialog.rs_tmpl = '<div class="idlg-n">&nbsp;</div><div class="idlg-ne">&nbsp;</div><div class="idlg-se">&nbsp;</div>'
+'<div class="idlg-s">&nbsp;</div><div class="idlg-sw">&nbsp;</div><div class="idlg-nw">&nbsp;</div>'
+'<div class="idlg-w">&nbsp;</div><div class="idlg-e">&nbsp;</div>';


/**
 * 默认配置
 */ 
Dialog.defaults = {

	/** 
	 * 窗口唯一标识，建议定义，这样可以避免重复弹出窗口
	 * @type String
	 */
	id: null,	
	
	/**
	 * 窗口标题，可以自定义；如果为 false，则隐藏标题
	 * @type String, false, null
	 */
	title: false,	
	
	/** 
	 * 窗口打开URL页面	
	 * @type String
	 */
	url: null,	  
	
	/**
	 * 窗口显示content字符串内容
	 * @type String, HTMLElement, function
	 */
	content: '',
	
	/**
	 * 窗口宽度， 默认为300px
	 * @type Number, String
	 */
	width: 300,

	/**
	 * 窗口高度，如果不指定，则自适应内容高度
	 * @type Number, String	
	 */
	height: 'auto',	
	
	/**
	 * 窗口水平显示位置，默认居中，支持百分比和具体数值
	 * @type Number, String(px, %)
	 */
	left: "50%",

	/**
	 * 窗口垂直显示位置，默认黄金分割比例显示，支持百分比和具体数值
	 * @type Number, String(px, %)
	 */
	top: "38.2%", 

	/**
	 * 窗口特殊主题样式（需要重写样式css），默认 默认主题样式
	 * @type String
	 */
	theme: null,
	
	/**
	 * 是否显示窗口右上角的关闭按钮
	 * @type Boolean
	 */
	closable: true, 

	/**
	 * 是否显示最大化按钮
	 * @type Boolean
	 */
	maxable: false,
	
	/**
	 * 是否显示最小化按钮
	 * @type Boolean
	 */
	minable: false,
	
	/**
	 * 窗口是否允许拖动，默认允许
	 * @type Boolean
	 */
	dragable: true,

	/**
	 * 窗口是否允许 resize 大小，默认不允许
	 * @type Boolean
	 */
	resizable: false,

	/**
	 * 是否静止定位不动，不支持IE6
	 * @type Boolean
	 */
	fixed: true, 
	
	/**
	 * 窗口是否为模态窗口(是否显示背景遮罩层)，
	 * @type Boolean
	 */
	modal: true,
	
	/**
	 * 弹出的窗口显示在哪个元素附近
	 * @type HTMLElement, {target:"string|HTMLElement", placement:"top|bottom|left|right"}
	 */
	follow: null,
	
	/**
	 * .confirm
	 * @type 按钮数组，按钮对象为：{id:'', label:'', width:'', intent:'primary|success|warning|danger', 
	 *								disabled:true|false, focus:true|false, align:left|right|center, click:function{}}
	 */
	button: [],

	/**
	 * 点击遮罩背景关闭窗口
	 * @type Boolean
	 */
	quickClosable: false, 

	/**
   * 窗口显示的上下文环境，默认顶层窗口
	 * @type Window
	 */
	context: null,

	/**
	 * 窗口显示在指定的容器中，默认 document.body下
	 * @type Element
	 */
	 container: null,
	
	/**
	 * 自定义显示层级数
	 * @type Number
	 */
	zindex: 9999,    
	
	/**
	 * 重置窗口关闭事件，函数this对象为Dialog
	 * @type function
	 */
	closeEvent: null, 
	
	/**
	 * 重置窗口最大化事件，函数this对象为Dialog
	 * @type function
	 */
	maximizeEvent: null, 
	
	/**
	 * 重置窗口最小化事件，函数this对象为Dialog
	 * @type function
	 */
	minimizeEvent: null, 
	
	/**
	 * 窗口打开后，执行的事件
	 * @type function
	 */
	onLoad: null, 
	
	/**
	 * 当窗口显示后要执行的回调函数
	 * 注意和onLoad的区分，注：函数上下文this对象指向Dialog
	 * @type function
	 */
	onShow: null,

	/**
	 * 当窗口关闭后要执行的回调函数，注：函数上下文this对象指向Dialog
	 * @type function
	 */
	onClosed: null,
	
	/**
	 * 当窗口被拖动时要执行的回调函数，注：函数上下文this对象指向Dialog
	 * @type function({'left':x, 'top':y})
	 */
	onDrag: null,
	
	/**
	 * 当窗口被改变大小时要执行的回调函数，注：函数上下文this对象指向Dialog
	 * @type function({'width':w, 'height':h, 'left':x, 'top':y})
	 */
	onResize: null,
	
	// 窗口resize的最小尺寸限制
	_resize: { 'minWidth': 200, 'minHeight': 100 },
	
	alert: {
		title: '信息',
		yesLabel: '确定'
	},

	confirm: {
		title: '询问',
		yesLabel: '确定',
		noLabel: '取消'
	}
	
};

	// 提供 noConflict方法避免Dialog名称冲突
	var _Dialog = root.Dialog;
	Dialog.noConflict = function() {
		root.Dialog = _Dialog;
		return Dialog;
	};
	
	// 支持 AMD module，比如：使用 requirejs 加载
	if(typeof define === 'function' && define.amd) {
		define(function() {
			return Dialog;
		});
	}

	// 导出Dialog为全局变量
	!root.Dialog && (root.Dialog = Dialog);
	
})(window, document);
},{}],2:[function(require,module,exports){
/**
 * FUI component -- Pagination
 * @author yswang
 * @version 2016/05/17
 */
;(function(window, document, undefined){
	var Pagination = function(target, opts) {
		opts = opts || {};
		if(!target) return;
		
		this._id = '_ai_pg_'+ (target.id ? target.id : (+new Date()));
		this.target = target.jquery ? target[0] : target;
		this.config = {};
		for(var p in Pagination.defaults) {
			this.config[p] = typeof opts[p] === 'undefined' ? Pagination.defaults[p] : opts[p];
		}
		if('[object Object]' == {}.toString.call(this.config.resizer) && this.config.resizer.label === undefined) {
			this.config.resizer.label = Pagination.defaults.resizer.label;
		}
		var cfg = this.config;
		// check
		this.totalrows = parseInt(cfg.totalrows, 10);
		this.pageno = parseInt(cfg.pageno, 10);
		this.pagesize = parseInt(cfg.pagesize, 10);
		
		if (isNaN(this.totalrows) || this.totalrows < 0) { this.totalrows = 0; }
		if (isNaN(this.pageno) || this.pageno < 1) { this.page = 1; }
		if (isNaN(this.pagesize) || this.pagesize < 1) { this.pagesize = 20; }
		this.pages = this._getPages();
		if(this.pageno > this.pages) { this.pageno = this.pages; }
		
		// save instance
    if(window[this._id]) {
      window[this._id].config.callback = null;
      window[this._id] = null;
    }

		window[this._id] = this;
		this._init();
	};
	
	Pagination.prototype = {
		_init: function() {
			var _this = this,
				page_html = [],
				cfg = this.config,
				prevPage = this.pageno - 1, 
				nextPage = this.pageno + 1,
				mode = cfg.mode,
				_jumptxt = '',
				_target = this.target;
			
			if(this.totalrows <= 0) {
				_target.innerHTML = '';
				return;
			}
			
			// 如果页码不足2页则不显示
			if(this.totalpages < 2) {
				//_target.innerHTML = '';
				//return;
			}
			
			(mode == '' || typeof(mode) == 'undefined') && (mode = 'modern');
			
			// 输出
			if(!_target.className || _target.className.indexOf('ai-pager') == -1) {
				_target.className = 'ai-pager'+ (_target.className ? ' '+_target.className : '');
			}
			
			// page info
			cfg.pageinfo === true && (cfg.pageinfo = Pagination.defaults.pageinfo);
			if(cfg.pageinfo && typeof cfg.pageinfo == 'string') {
				page_html.push('<div class="page-info">');
				page_html.push(this._formatLabel(cfg.pageinfo));
				page_html.push('</div>');
			} else {
				(_target.className.indexOf('no-pageinfo') == -1) && (_target.className += " no-pageinfo");
			}
			
			// page nos
			page_html.push('<div class="page-nos">');
			
			function _href(pageno){
				return !cfg.href ? "javascript:void(0);" 
						: cfg.href.replace(/#{\s*pageno\s*}/gi, pageno).replace(/#{\s*pagesize\s*}/gi, _this.pagesize);
			}
			
			if(cfg.resizer && '[object Array]' === {}.toString.call(cfg.resizer.values) && cfg.resizer.values.length > 0) {
				//page_html.push('<span class="page-rs-label">');
				//page_html.push(cfg.resizer.label);
				//page_html.push('</span>');
				page_html.push('<span class="page-rs"><select onchange="javascript:'+ this._id +'._doResize(this);">');
        // 传入了一个例外的pagesize值
        var isExceptPageSize = true;
        for(var i = 0; i < cfg.resizer.values.length; i++) {
          if(parseInt(cfg.resizer.values[i]) == _this.pagesize) {
            isExceptPageSize = false;
            break;
          }
				}
        
        // 传入了一个例外的pagesize值，则作为第一个额外加入
        if(isExceptPageSize) {
          cfg.resizer.values.splice(0, 0, _this.pagesize);
        }
        
				for(var i = 0; i < cfg.resizer.values.length; i++) {
					var s = parseInt(cfg.resizer.values[i]);
					page_html.push('<option value="'+ s +'"'+(s==_this.pagesize?" selected":"")+'>'+ (cfg.resizer.label.replace(/#{\s*size\s*}/gi, s)) +'</option>');
				}
        
				page_html.push('</select><span class="page-rs-val">'+ (cfg.resizer.label.replace(/#{\s*size\s*}/gi, _this.pagesize)) +'</span><i class="page-rs-arr"></i></span>');
			}
			
			if(prevPage < 1) {
				mode == 'classic' && (cfg.firstlabel !== false) && page_html.push('<span class="page-first-dis">'+ cfg.firstlabel +'</span>');
				mode == 'classic' && (cfg.prevlabel !== false) && page_html.push('<span class="page-prev-dis">'+ cfg.prevlabel +'</span>');
			} else {
				mode == 'classic'&& (cfg.firstlabel !== false) && page_html.push('<a href="'+ _href(1) +'" onclick="javascript:'+ this._id +'.toPage(1);" class="page-first">'+ cfg.firstlabel +'</a>');
				(cfg.prevlabel !== false) && page_html.push('<a href="'+ _href(prevPage) +'" onclick="javascript:'+ this._id +'.toPage(' + prevPage + ');" class="page-prev">'+ cfg.prevlabel +'</a>');
			}
			
			// 非经典模式下，显示页码
			if(mode != 'classic' && cfg.showpagenos && this._getPages() > 1) {
				if(this.pageno != 1) { 
					page_html.push('<a href="'+ _href(1) +'" onclick="javascript:'+ this._id +'.toPage(1);" class="page-no">1</a>');
				}
				
				if(this.pageno >= 5) {
					page_html.push('<span class="page-ell">...</span>');
				}
				
				var endPage = 0;
				if(this.totalpages > this.pageno + 2) {
					endPage = this.pageno + 2;
				} else {
					endPage = this.totalpages;
				}
				
				for(var i = this.pageno - 2; i <= endPage; i++) {
					if(i > 0) {
						if(i == this.pageno) {
							page_html.push('<span class="page-curr">' + i + '</span>');
						} else {
							if (i != 1 && i != this.totalpages) {
								page_html.push('<a href="'+ _href(i) +'" onclick="javascript:'+ this._id +'.toPage(' + i + ');" class="page-no">' + i + '</a>');
							}
						}
					}
				}
				
				if(this.pageno + 3 < this.totalpages) {
					page_html.push('<span class="page-ell">...</span>');
				}
				
				if (this.pageno != this.totalpages) {
					page_html.push('<a href="'+ _href(this.totalpages) +'" onclick="javascript:'+ this._id +'.toPage(' + this.totalpages + ');" class="page-no">' + this.totalpages + '</a>');
				}
			}
			
			// enable jump page
			if(cfg.jumpable === true && this.totalpages > 1) {
				_jumptxt = this._formatLabel(cfg.jumpformat);
				var _jtTemp = document.createElement('span');
				_jtTemp.style.cssText = 'position:absolute;left:0;top:-100px;z-index:0;overflow:hidden;visibility:hidden;';
				_jtTemp.innerHTML = _jumptxt;
				document.body.appendChild(_jtTemp);
				var _jtW = _jtTemp.offsetWidth + 6;
				_jtTemp.parentNode.removeChild(_jtTemp);
				_jtTemp = null;
				
				page_html.push('<span class="page-jump"><input type="text" style="width:'+ _jtW +'px;" value="'+ _jumptxt +'" onfocus="'+ this._id +'._inputJump(this,event);" onblur="'+ this._id +'._toJump(this);" onkeyup="'+ this._id +'._toJump(this, event);"/></span>');
			}
			
			if (nextPage > this.totalpages) {
				mode == 'classic' && (cfg.nextlabel !== false) && page_html.push('<span class="page-next-dis">'+ cfg.nextlabel +'</span>');
				mode == 'classic' && (cfg.lastlabel !== false) && page_html.push('<span class="page-last-dis">'+ cfg.lastlabel +'</span>');
			} else {
				(cfg.nextlabel !== false) && page_html.push('<a href="'+ _href(nextPage) +'" onclick="javascript:'+ this._id +'.toPage(' + nextPage + ');" class="page-next">'+ cfg.nextlabel +'</a>');
				mode == 'classic' && (cfg.lastlabel !== false) && page_html.push('<a href="'+ _href(this.totalpages) +'" onclick="javascript:'+ this._id +'.toPage(' + this.totalpages + ');" class="page-last">'+ cfg.lastlabel +'</a>');
			}
	
			page_html.push('</div>');
			
			this.totalrows == 0 && (_target.className += " no-pages");
			_target.innerHTML = '';
			_target.innerHTML = page_html.join('');
		},
		
		_getPages: function() {
			this.totalpages = Math.ceil(this.totalrows / this.pagesize);
			return Math.max(0, this.totalpages);
		},
		
		_getFrom: function() {
			this.from = (this.pageno - 1) * this.pagesize + 1;
			return this.totalrows > 0 ? Math.max(0, this.from) : 0;
		},
		
		_getTo: function() {
			this.to = this.pageno * this.pagesize;
			return Math.max(0, Math.min(this.totalrows, this.to));
		},
		
		_formatLabel: function(str) {
			return str.replace(/#{\s*totalrows\s*}/gi, this.totalrows)
						.replace(/#{\s*pageno\s*}/gi, this.pageno)
						.replace(/#{\s*pagesize\s*}/gi, this.pagesize)
						.replace(/#{\s*from\s*}/gi, this._getFrom())
						.replace(/#{\s*to\s*}/gi, this._getTo())
						.replace(/#{\s*totalpages\s*}/gi, this._getPages());
		},
		_doResize : function(select) {
			var opt = select.options[select.selectedIndex];
			this.pagesize = opt.value;
			$(select).next('.page-rs-val').text(opt.text);
			this.toPage(1);
		},
		_inputJump: function(input) {
			input.value = this.pageno;
			input.select();
		},
		
		_toJump: function(input, evt) {
			var page = parseInt(input.value, 10), curno = this.pageno;
			if(isNaN(page) || page < 1) { 
				page = curno; 
			}
			
			if(page > this.totalpages) {
				page = this.totalpages;
			}
			
			if(!evt || evt.keyCode === 13) {
				this.pageno = page;
				input.value = this._formatLabel(this.config.jumpformat);//page + ' / '+ this.totalpages; 
				(curno != this.pageno) ? this.toPage(page) : input.blur();
			}
		},
		
		toPage: function(page) {
			this.pageno = Math.min(Math.max(1, page), this.totalpages);
			typeof this.config.callback == 'function' && this.config.callback.call(this, this.pageno, this.pagesize);	
			this._init();
		},
		firstPage: function() {
			this.toPage(1);
		},
		prevPage: function() {
			(this.pageno > 1) && this.toPage(this.pageno - 1);
		},
		nextPage: function() {
			(this.pageno < this.totalpages) && this.toPage(this.pageno + 1);
		},
		lastPage: function() {
			this.toPage(this.totalpages);
		}
	};
	
	Pagination.defaults = {
		totalrows: 0,
		pagesize: 20,
		pageno: 1,
		pageinfo: '共 #{totalrows} 条记录，当前显示第 #{from} - #{to} 条',
		firstlabel: '首页',
		prevlabel: '上一页',
		nextlabel: '下一页',
		lastlabel: '尾页',
		resizer: {values:[10,20,50,100,200,500], label: "每页 #{size} 条"},
		jumpable: true,
		jumpformat: '#{pageno} / #{totalpages} 页',
		showpagenos: true,
		mode: 'modern',
		href: 'javascript:void(0);',
		callback: false
	};

	!window.Pagination && (window.Pagination = Pagination);
	
})(window, document);

//jQuery plugin
;(function(jq){
	if(!jq) return;
	jq.fn.pagination = function(opts) {
		return new Pagination(this[0], opts);
	};
})(window.jQuery);

},{}],3:[function(require,module,exports){
require("./bootstrap/transition");
require("./bootstrap/alert");
require("./bootstrap/button");
require("./bootstrap/carousel");
require("./bootstrap/collapse");
require("./bootstrap/dropdown");
require("./bootstrap/modal");
require("./bootstrap/tab");
require("./bootstrap/affix");
require("./bootstrap/scrollspy");
require("./bootstrap/tooltip");
require("./bootstrap/popover");
require("./bootstrap/global");

},{"./bootstrap/affix":4,"./bootstrap/alert":5,"./bootstrap/button":6,"./bootstrap/carousel":7,"./bootstrap/collapse":8,"./bootstrap/dropdown":9,"./bootstrap/global":10,"./bootstrap/modal":11,"./bootstrap/popover":12,"./bootstrap/scrollspy":13,"./bootstrap/tab":14,"./bootstrap/tooltip":15,"./bootstrap/transition":16}],4:[function(require,module,exports){
/* ========================================================================
 * Bootstrap: affix.js v3.3.7
 * http://getbootstrap.com/javascript/#affix
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // AFFIX CLASS DEFINITION
  // ======================

  var Affix = function (element, options) {
    this.options = $.extend({}, Affix.DEFAULTS, options)

    this.$target = $(this.options.target)
      .on('scroll.bs.affix.data-api', $.proxy(this.checkPosition, this))
      .on('click.bs.affix.data-api',  $.proxy(this.checkPositionWithEventLoop, this))

    this.$element     = $(element)
    this.affixed      = null
    this.unpin        = null
    this.pinnedOffset = null

    this.checkPosition()
  }

  Affix.VERSION  = '3.3.7'

  Affix.RESET    = 'affix affix-top affix-bottom'

  Affix.DEFAULTS = {
    offset: 0,
    target: window
  }

  Affix.prototype.getState = function (scrollHeight, height, offsetTop, offsetBottom) {
    var scrollTop    = this.$target.scrollTop()
    var position     = this.$element.offset()
    var targetHeight = this.$target.height()

    if (offsetTop != null && this.affixed == 'top') return scrollTop < offsetTop ? 'top' : false

    if (this.affixed == 'bottom') {
      if (offsetTop != null) return (scrollTop + this.unpin <= position.top) ? false : 'bottom'
      return (scrollTop + targetHeight <= scrollHeight - offsetBottom) ? false : 'bottom'
    }

    var initializing   = this.affixed == null
    var colliderTop    = initializing ? scrollTop : position.top
    var colliderHeight = initializing ? targetHeight : height

    if (offsetTop != null && scrollTop <= offsetTop) return 'top'
    if (offsetBottom != null && (colliderTop + colliderHeight >= scrollHeight - offsetBottom)) return 'bottom'

    return false
  }

  Affix.prototype.getPinnedOffset = function () {
    if (this.pinnedOffset) return this.pinnedOffset
    this.$element.removeClass(Affix.RESET).addClass('affix')
    var scrollTop = this.$target.scrollTop()
    var position  = this.$element.offset()
    return (this.pinnedOffset = position.top - scrollTop)
  }

  Affix.prototype.checkPositionWithEventLoop = function () {
    setTimeout($.proxy(this.checkPosition, this), 1)
  }

  Affix.prototype.checkPosition = function () {
    if (!this.$element.is(':visible')) return

    var height       = this.$element.height()
    var offset       = this.options.offset
    var offsetTop    = offset.top
    var offsetBottom = offset.bottom
    var scrollHeight = Math.max($(document).height(), $(document.body).height())

    if (typeof offset != 'object')         offsetBottom = offsetTop = offset
    if (typeof offsetTop == 'function')    offsetTop    = offset.top(this.$element)
    if (typeof offsetBottom == 'function') offsetBottom = offset.bottom(this.$element)

    var affix = this.getState(scrollHeight, height, offsetTop, offsetBottom)

    if (this.affixed != affix) {
      if (this.unpin != null) this.$element.css('top', '')

      var affixType = 'affix' + (affix ? '-' + affix : '')
      var e         = $.Event(affixType + '.bs.affix')

      this.$element.trigger(e)

      if (e.isDefaultPrevented()) return

      this.affixed = affix
      this.unpin = affix == 'bottom' ? this.getPinnedOffset() : null

      this.$element
        .removeClass(Affix.RESET)
        .addClass(affixType)
        .trigger(affixType.replace('affix', 'affixed') + '.bs.affix')
    }

    if (affix == 'bottom') {
      this.$element.offset({
        top: scrollHeight - height - offsetBottom
      })
    }
  }


  // AFFIX PLUGIN DEFINITION
  // =======================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.affix')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.affix', (data = new Affix(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.affix

  $.fn.affix             = Plugin
  $.fn.affix.Constructor = Affix


  // AFFIX NO CONFLICT
  // =================

  $.fn.affix.noConflict = function () {
    $.fn.affix = old
    return this
  }


  // AFFIX DATA-API
  // ==============

  $(window).on('load', function () {
    $('[data-spy="affix"]').each(function () {
      var $spy = $(this)
      var data = $spy.data()

      data.offset = data.offset || {}

      if (data.offsetBottom != null) data.offset.bottom = data.offsetBottom
      if (data.offsetTop    != null) data.offset.top    = data.offsetTop

      Plugin.call($spy, data)
    })
  })

}(jQuery);

},{}],5:[function(require,module,exports){
/* ========================================================================
 * Bootstrap: alert.js v3.3.7
 * http://getbootstrap.com/javascript/#alerts
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // ALERT CLASS DEFINITION
  // ======================

  var dismiss = '[data-dismiss="alert"]'
  var Alert   = function (el) {
    $(el).on('click', dismiss, this.close)
  }

  Alert.VERSION = '3.3.7'

  Alert.TRANSITION_DURATION = 150

  Alert.prototype.close = function (e) {
    var $this    = $(this)
    var selector = $this.attr('data-target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
    }

    var $parent = $(selector === '#' ? [] : selector)

    if (e) e.preventDefault()

    if (!$parent.length) {
      $parent = $this.closest('.alert')
    }

    $parent.trigger(e = $.Event('close.bs.alert'))

    if (e.isDefaultPrevented()) return

    $parent.removeClass('in')

    function removeElement() {
      // detach from parent, fire event then clean up data
      $parent.detach().trigger('closed.bs.alert').remove()
    }

    $.support.transition && $parent.hasClass('fade') ?
      $parent
        .one('bsTransitionEnd', removeElement)
        .emulateTransitionEnd(Alert.TRANSITION_DURATION) :
      removeElement()
  }


  // ALERT PLUGIN DEFINITION
  // =======================

  function Plugin(option) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.alert')

      if (!data) $this.data('bs.alert', (data = new Alert(this)))
      if (typeof option == 'string') data[option].call($this)
    })
  }

  var old = $.fn.alert

  $.fn.alert             = Plugin
  $.fn.alert.Constructor = Alert


  // ALERT NO CONFLICT
  // =================

  $.fn.alert.noConflict = function () {
    $.fn.alert = old
    return this
  }


  // ALERT DATA-API
  // ==============

  $(document).on('click.bs.alert.data-api', dismiss, Alert.prototype.close)

}(jQuery);

},{}],6:[function(require,module,exports){
/* ========================================================================
 * Bootstrap: button.js v3.3.7
 * http://getbootstrap.com/javascript/#buttons
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // BUTTON PUBLIC CLASS DEFINITION
  // ==============================

  var Button = function (element, options) {
    this.$element  = $(element)
    this.options   = $.extend({}, Button.DEFAULTS, options)
    this.isLoading = false
  }

  Button.VERSION  = '3.3.7'

  Button.DEFAULTS = {
    loadingText: 'loading...'
  }

  Button.prototype.setState = function (state) {
    var d    = 'disabled'
    var $el  = this.$element
    var val  = $el.is('input') ? 'val' : 'html'
    var data = $el.data()

    state += 'Text'

    if (data.resetText == null) $el.data('resetText', $el[val]())

    // push to event loop to allow forms to submit
    setTimeout($.proxy(function () {
      $el[val](data[state] == null ? this.options[state] : data[state])

      if (state == 'loadingText') {
        this.isLoading = true
        $el.addClass(d).attr(d, d).prop(d, true)
      } else if (this.isLoading) {
        this.isLoading = false
        $el.removeClass(d).removeAttr(d).prop(d, false)
      }
    }, this), 0)
  }

  Button.prototype.toggle = function () {
    var changed = true
    var $parent = this.$element.closest('[data-toggle="buttons"]')

    if ($parent.length) {
      var $input = this.$element.find('input')
      if ($input.prop('type') == 'radio') {
        if ($input.prop('checked')) changed = false
        $parent.find('.active').removeClass('active')
        this.$element.addClass('active')
      } else if ($input.prop('type') == 'checkbox') {
        if (($input.prop('checked')) !== this.$element.hasClass('active')) changed = false
        this.$element.toggleClass('active')
      }
      $input.prop('checked', this.$element.hasClass('active'))
      if (changed) $input.trigger('change')
    } else {
      this.$element.attr('aria-pressed', !this.$element.hasClass('active'))
      this.$element.toggleClass('active')
    }
  }


  // BUTTON PLUGIN DEFINITION
  // ========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.button')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.button', (data = new Button(this, options)))

      if (option == 'toggle') data.toggle()
      else if (option) data.setState(option)
    })
  }

  var old = $.fn.button

  $.fn.button             = Plugin
  $.fn.button.Constructor = Button


  // BUTTON NO CONFLICT
  // ==================

  $.fn.button.noConflict = function () {
    $.fn.button = old
    return this
  }


  // BUTTON DATA-API
  // ===============

  $(document)
    .on('click.bs.button.data-api', '[data-toggle^="button"]', function (e) {
      var $btn = $(e.target).closest('.btn')
      Plugin.call($btn, 'toggle')
      if (!($(e.target).is('input[type="radio"], input[type="checkbox"]'))) {
        // Prevent double click on radios, and the double selections (so cancellation) on checkboxes
        e.preventDefault()
        // The target component still receive the focus
        if ($btn.is('input,button')) $btn.trigger('focus')
        else $btn.find('input:visible,button:visible').first().trigger('focus')
      }
    })
    .on('focus.bs.button.data-api blur.bs.button.data-api', '[data-toggle^="button"]', function (e) {
      $(e.target).closest('.btn').toggleClass('focus', /^focus(in)?$/.test(e.type))
    })

}(jQuery);

},{}],7:[function(require,module,exports){
/* ========================================================================
 * Bootstrap: carousel.js v3.3.7
 * http://getbootstrap.com/javascript/#carousel
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // CAROUSEL CLASS DEFINITION
  // =========================

  var Carousel = function (element, options) {
    this.$element    = $(element)
    this.$indicators = this.$element.find('.carousel-indicators')
    this.options     = options
    this.paused      = null
    this.sliding     = null
    this.interval    = null
    this.$active     = null
    this.$items      = null

    this.options.keyboard && this.$element.on('keydown.bs.carousel', $.proxy(this.keydown, this))

    this.options.pause == 'hover' && !('ontouchstart' in document.documentElement) && this.$element
      .on('mouseenter.bs.carousel', $.proxy(this.pause, this))
      .on('mouseleave.bs.carousel', $.proxy(this.cycle, this))
  }

  Carousel.VERSION  = '3.3.7'

  Carousel.TRANSITION_DURATION = 600

  Carousel.DEFAULTS = {
    interval: 5000,
    pause: 'hover',
    wrap: true,
    keyboard: true
  }

  Carousel.prototype.keydown = function (e) {
    if (/input|textarea/i.test(e.target.tagName)) return
    switch (e.which) {
      case 37: this.prev(); break
      case 39: this.next(); break
      default: return
    }

    e.preventDefault()
  }

  Carousel.prototype.cycle = function (e) {
    e || (this.paused = false)

    this.interval && clearInterval(this.interval)

    this.options.interval
      && !this.paused
      && (this.interval = setInterval($.proxy(this.next, this), this.options.interval))

    return this
  }

  Carousel.prototype.getItemIndex = function (item) {
    this.$items = item.parent().children('.item')
    return this.$items.index(item || this.$active)
  }

  Carousel.prototype.getItemForDirection = function (direction, active) {
    var activeIndex = this.getItemIndex(active)
    var willWrap = (direction == 'prev' && activeIndex === 0)
                || (direction == 'next' && activeIndex == (this.$items.length - 1))
    if (willWrap && !this.options.wrap) return active
    var delta = direction == 'prev' ? -1 : 1
    var itemIndex = (activeIndex + delta) % this.$items.length
    return this.$items.eq(itemIndex)
  }

  Carousel.prototype.to = function (pos) {
    var that        = this
    var activeIndex = this.getItemIndex(this.$active = this.$element.find('.item.active'))

    if (pos > (this.$items.length - 1) || pos < 0) return

    if (this.sliding)       return this.$element.one('slid.bs.carousel', function () { that.to(pos) }) // yes, "slid"
    if (activeIndex == pos) return this.pause().cycle()

    return this.slide(pos > activeIndex ? 'next' : 'prev', this.$items.eq(pos))
  }

  Carousel.prototype.pause = function (e) {
    e || (this.paused = true)

    if (this.$element.find('.next, .prev').length && $.support.transition) {
      this.$element.trigger($.support.transition.end)
      this.cycle(true)
    }

    this.interval = clearInterval(this.interval)

    return this
  }

  Carousel.prototype.next = function () {
    if (this.sliding) return
    return this.slide('next')
  }

  Carousel.prototype.prev = function () {
    if (this.sliding) return
    return this.slide('prev')
  }

  Carousel.prototype.slide = function (type, next) {
    var $active   = this.$element.find('.item.active')
    var $next     = next || this.getItemForDirection(type, $active)
    var isCycling = this.interval
    var direction = type == 'next' ? 'left' : 'right'
    var that      = this

    if ($next.hasClass('active')) return (this.sliding = false)

    var relatedTarget = $next[0]
    var slideEvent = $.Event('slide.bs.carousel', {
      relatedTarget: relatedTarget,
      direction: direction
    })
    this.$element.trigger(slideEvent)
    if (slideEvent.isDefaultPrevented()) return

    this.sliding = true

    isCycling && this.pause()

    if (this.$indicators.length) {
      this.$indicators.find('.active').removeClass('active')
      var $nextIndicator = $(this.$indicators.children()[this.getItemIndex($next)])
      $nextIndicator && $nextIndicator.addClass('active')
    }

    var slidEvent = $.Event('slid.bs.carousel', { relatedTarget: relatedTarget, direction: direction }) // yes, "slid"
    if ($.support.transition && this.$element.hasClass('slide')) {
      $next.addClass(type)
      $next[0].offsetWidth // force reflow
      $active.addClass(direction)
      $next.addClass(direction)
      $active
        .one('bsTransitionEnd', function () {
          $next.removeClass([type, direction].join(' ')).addClass('active')
          $active.removeClass(['active', direction].join(' '))
          that.sliding = false
          setTimeout(function () {
            that.$element.trigger(slidEvent)
          }, 0)
        })
        .emulateTransitionEnd(Carousel.TRANSITION_DURATION)
    } else {
      $active.removeClass('active')
      $next.addClass('active')
      this.sliding = false
      this.$element.trigger(slidEvent)
    }

    isCycling && this.cycle()

    return this
  }


  // CAROUSEL PLUGIN DEFINITION
  // ==========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.carousel')
      var options = $.extend({}, Carousel.DEFAULTS, $this.data(), typeof option == 'object' && option)
      var action  = typeof option == 'string' ? option : options.slide

      if (!data) $this.data('bs.carousel', (data = new Carousel(this, options)))
      if (typeof option == 'number') data.to(option)
      else if (action) data[action]()
      else if (options.interval) data.pause().cycle()
    })
  }

  var old = $.fn.carousel

  $.fn.carousel             = Plugin
  $.fn.carousel.Constructor = Carousel


  // CAROUSEL NO CONFLICT
  // ====================

  $.fn.carousel.noConflict = function () {
    $.fn.carousel = old
    return this
  }


  // CAROUSEL DATA-API
  // =================

  var clickHandler = function (e) {
    var href
    var $this   = $(this)
    var $target = $($this.attr('data-target') || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')) // strip for ie7
    if (!$target.hasClass('carousel')) return
    var options = $.extend({}, $target.data(), $this.data())
    var slideIndex = $this.attr('data-slide-to')
    if (slideIndex) options.interval = false

    Plugin.call($target, options)

    if (slideIndex) {
      $target.data('bs.carousel').to(slideIndex)
    }

    e.preventDefault()
  }

  $(document)
    .on('click.bs.carousel.data-api', '[data-slide]', clickHandler)
    .on('click.bs.carousel.data-api', '[data-slide-to]', clickHandler)

  $(window).on('load', function () {
    $('[data-ride="carousel"]').each(function () {
      var $carousel = $(this)
      Plugin.call($carousel, $carousel.data())
    })
  })

}(jQuery);

},{}],8:[function(require,module,exports){
/* ========================================================================
 * Bootstrap: collapse.js v3.3.7
 * http://getbootstrap.com/javascript/#collapse
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */

/* jshint latedef: false */

+function ($) {
  'use strict';

  // COLLAPSE PUBLIC CLASS DEFINITION
  // ================================

  var Collapse = function (element, options) {
    this.$element      = $(element)
    this.options       = $.extend({}, Collapse.DEFAULTS, options)
    this.$trigger      = $('[data-toggle="collapse"][href="#' + element.id + '"],' +
                           '[data-toggle="collapse"][data-target="#' + element.id + '"]')
    this.transitioning = null

    if (this.options.parent) {
      this.$parent = this.getParent()
    } else {
      this.addAriaAndCollapsedClass(this.$element, this.$trigger)
    }

    if (this.options.toggle) this.toggle()
  }

  Collapse.VERSION  = '3.3.7'

  Collapse.TRANSITION_DURATION = 350

  Collapse.DEFAULTS = {
    toggle: true
  }

  Collapse.prototype.dimension = function () {
    var hasWidth = this.$element.hasClass('width')
    return hasWidth ? 'width' : 'height'
  }

  Collapse.prototype.show = function () {
    if (this.transitioning || this.$element.hasClass('in')) return

    var activesData
    var actives = this.$parent && this.$parent.children('.panel').children('.in, .collapsing')

    if (actives && actives.length) {
      activesData = actives.data('bs.collapse')
      if (activesData && activesData.transitioning) return
    }

    var startEvent = $.Event('show.bs.collapse')
    this.$element.trigger(startEvent)
    if (startEvent.isDefaultPrevented()) return

    if (actives && actives.length) {
      Plugin.call(actives, 'hide')
      activesData || actives.data('bs.collapse', null)
    }

    var dimension = this.dimension()

    this.$element
      .removeClass('collapse')
      .addClass('collapsing')[dimension](0)
      .attr('aria-expanded', true)

    this.$trigger
      .removeClass('collapsed')
      .attr('aria-expanded', true)

    this.transitioning = 1

    var complete = function () {
      this.$element
        .removeClass('collapsing')
        .addClass('collapse in')[dimension]('')
      this.transitioning = 0
      this.$element
        .trigger('shown.bs.collapse')
    }

    if (!$.support.transition) return complete.call(this)

    var scrollSize = $.camelCase(['scroll', dimension].join('-'))

    this.$element
      .one('bsTransitionEnd', $.proxy(complete, this))
      .emulateTransitionEnd(Collapse.TRANSITION_DURATION)[dimension](this.$element[0][scrollSize])
  }

  Collapse.prototype.hide = function () {
    if (this.transitioning || !this.$element.hasClass('in')) return

    var startEvent = $.Event('hide.bs.collapse')
    this.$element.trigger(startEvent)
    if (startEvent.isDefaultPrevented()) return

    var dimension = this.dimension()

    this.$element[dimension](this.$element[dimension]())[0].offsetHeight

    this.$element
      .addClass('collapsing')
      .removeClass('collapse in')
      .attr('aria-expanded', false)

    this.$trigger
      .addClass('collapsed')
      .attr('aria-expanded', false)

    this.transitioning = 1

    var complete = function () {
      this.transitioning = 0
      this.$element
        .removeClass('collapsing')
        .addClass('collapse')
        .trigger('hidden.bs.collapse')
    }

    if (!$.support.transition) return complete.call(this)

    this.$element
      [dimension](0)
      .one('bsTransitionEnd', $.proxy(complete, this))
      .emulateTransitionEnd(Collapse.TRANSITION_DURATION)
  }

  Collapse.prototype.toggle = function () {
    this[this.$element.hasClass('in') ? 'hide' : 'show']()
  }

  Collapse.prototype.getParent = function () {
    return $(this.options.parent)
      .find('[data-toggle="collapse"][data-parent="' + this.options.parent + '"]')
      .each($.proxy(function (i, element) {
        var $element = $(element)
        this.addAriaAndCollapsedClass(getTargetFromTrigger($element), $element)
      }, this))
      .end()
  }

  Collapse.prototype.addAriaAndCollapsedClass = function ($element, $trigger) {
    var isOpen = $element.hasClass('in')

    $element.attr('aria-expanded', isOpen)
    $trigger
      .toggleClass('collapsed', !isOpen)
      .attr('aria-expanded', isOpen)
  }

  function getTargetFromTrigger($trigger) {
    var href
    var target = $trigger.attr('data-target')
      || (href = $trigger.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '') // strip for ie7

    return $(target)
  }


  // COLLAPSE PLUGIN DEFINITION
  // ==========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.collapse')
      var options = $.extend({}, Collapse.DEFAULTS, $this.data(), typeof option == 'object' && option)

      if (!data && options.toggle && /show|hide/.test(option)) options.toggle = false
      if (!data) $this.data('bs.collapse', (data = new Collapse(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.collapse

  $.fn.collapse             = Plugin
  $.fn.collapse.Constructor = Collapse


  // COLLAPSE NO CONFLICT
  // ====================

  $.fn.collapse.noConflict = function () {
    $.fn.collapse = old
    return this
  }


  // COLLAPSE DATA-API
  // =================

  $(document).on('click.bs.collapse.data-api', '[data-toggle="collapse"]', function (e) {
    var $this   = $(this)

    if (!$this.attr('data-target')) e.preventDefault()

    var $target = getTargetFromTrigger($this)
    var data    = $target.data('bs.collapse')
    var option  = data ? 'toggle' : $this.data()

    Plugin.call($target, option)
  })

}(jQuery);

},{}],9:[function(require,module,exports){
/* ========================================================================
 * Bootstrap: dropdown.js v3.3.7
 * http://getbootstrap.com/javascript/#dropdowns
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // DROPDOWN CLASS DEFINITION
  // =========================

  var backdrop = '.dropdown-backdrop'
  var toggle   = '[data-toggle="dropdown"]'
  var Dropdown = function (element) {
    $(element).on('click.bs.dropdown', this.toggle)
  }

  Dropdown.VERSION = '3.3.7'

  function getParent($this) {
    var selector = $this.attr('data-target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && /#[A-Za-z]/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
    }

    var $parent = selector && $(selector)

    return $parent && $parent.length ? $parent : $this.parent()
  }

  function clearMenus(e) {
    if (e && e.which === 3) return
    $(backdrop).remove()
    $(toggle).each(function () {
      var $this         = $(this)
      var $parent       = getParent($this)
      var relatedTarget = { relatedTarget: this }

      if (!$parent.hasClass('open')) return

      if (e && e.type == 'click' && /input|textarea/i.test(e.target.tagName) && $.contains($parent[0], e.target)) return

      $parent.trigger(e = $.Event('hide.bs.dropdown', relatedTarget))

      if (e.isDefaultPrevented()) return

      $this.attr('aria-expanded', 'false')
      $parent.removeClass('open').trigger($.Event('hidden.bs.dropdown', relatedTarget))
    })
  }

  Dropdown.prototype.toggle = function (e) {
    var $this = $(this)

    if ($this.is('.disabled, :disabled')) return

    var $parent  = getParent($this)
    var isActive = $parent.hasClass('open')

    clearMenus()

    if (!isActive) {
      if ('ontouchstart' in document.documentElement && !$parent.closest('.navbar-nav').length) {
        // if mobile we use a backdrop because click events don't delegate
        $(document.createElement('div'))
          .addClass('dropdown-backdrop')
          .insertAfter($(this))
          .on('click', clearMenus)
      }

      var relatedTarget = { relatedTarget: this }
      $parent.trigger(e = $.Event('show.bs.dropdown', relatedTarget))

      if (e.isDefaultPrevented()) return

      $this
        .trigger('focus')
        .attr('aria-expanded', 'true')

      $parent
        .toggleClass('open')
        .trigger($.Event('shown.bs.dropdown', relatedTarget))
    }

    return false
  }

  Dropdown.prototype.keydown = function (e) {
    if (!/(38|40|27|32)/.test(e.which) || /input|textarea/i.test(e.target.tagName)) return

    var $this = $(this)

    e.preventDefault()
    e.stopPropagation()

    if ($this.is('.disabled, :disabled')) return

    var $parent  = getParent($this)
    var isActive = $parent.hasClass('open')

    if (!isActive && e.which != 27 || isActive && e.which == 27) {
      if (e.which == 27) $parent.find(toggle).trigger('focus')
      return $this.trigger('click')
    }

    var desc = ' li:not(.disabled):visible a'
    var $items = $parent.find('.dropdown-menu' + desc)

    if (!$items.length) return

    var index = $items.index(e.target)

    if (e.which == 38 && index > 0)                 index--         // up
    if (e.which == 40 && index < $items.length - 1) index++         // down
    if (!~index)                                    index = 0

    $items.eq(index).trigger('focus')
  }


  // DROPDOWN PLUGIN DEFINITION
  // ==========================

  function Plugin(option) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.dropdown')

      if (!data) $this.data('bs.dropdown', (data = new Dropdown(this)))
      if (typeof option == 'string') data[option].call($this)
    })
  }

  var old = $.fn.dropdown

  $.fn.dropdown             = Plugin
  $.fn.dropdown.Constructor = Dropdown


  // DROPDOWN NO CONFLICT
  // ====================

  $.fn.dropdown.noConflict = function () {
    $.fn.dropdown = old
    return this
  }


  // APPLY TO STANDARD DROPDOWN ELEMENTS
  // ===================================

  $(document)
    .on('click.bs.dropdown.data-api', clearMenus)
    .on('click.bs.dropdown.data-api', '.dropdown form', function (e) { e.stopPropagation() })
    .on('click.bs.dropdown.data-api', toggle, Dropdown.prototype.toggle)
    .on('keydown.bs.dropdown.data-api', toggle, Dropdown.prototype.keydown)
    .on('keydown.bs.dropdown.data-api', '.dropdown-menu', Dropdown.prototype.keydown)

}(jQuery);

},{}],10:[function(require,module,exports){
/**
 * global 定义组件库全局事件
 */

+function ($) {
	'use strict';

	/*
	*  按钮微动效类
	*/    
	$(document).on("mouseup",".btn:not('[disabled]'),[rippled]:not('[disabled]')",function(){

		var that = this;
		
		$(this).addClass("btn-clicked");

		setTimeout(function(){
			$(that).removeClass("btn-clicked"); 
		},650)

	})

}(jQuery);
},{}],11:[function(require,module,exports){
/* ========================================================================
 * Bootstrap: modal.js v3.3.7
 * http://getbootstrap.com/javascript/#modals
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // MODAL CLASS DEFINITION
  // ======================

  var Modal = function (element, options) {
    this.options             = options
    this.$body               = $(document.body)
    this.$element            = $(element)
    this.$dialog             = this.$element.find('.modal-dialog')
    this.$backdrop           = null
    this.isShown             = null
    this.originalBodyPad     = null
    this.scrollbarWidth      = 0
    this.ignoreBackdropClick = false

    if (this.options.remote) {
      this.$element
        .find('.modal-content')
        .load(this.options.remote, $.proxy(function () {
          this.$element.trigger('loaded.bs.modal')
        }, this))
    }
  }

  Modal.VERSION  = '3.3.7'

  Modal.TRANSITION_DURATION = 300
  Modal.BACKDROP_TRANSITION_DURATION = 150

  Modal.DEFAULTS = {
    backdrop: true,
    keyboard: true,
    show: true
  }

  Modal.prototype.toggle = function (_relatedTarget) {
    return this.isShown ? this.hide() : this.show(_relatedTarget)
  }

  Modal.prototype.show = function (_relatedTarget) {
    var that = this
    var e    = $.Event('show.bs.modal', { relatedTarget: _relatedTarget })

    this.$element.trigger(e)

    if (this.isShown || e.isDefaultPrevented()) return

    this.isShown = true

    this.checkScrollbar()
    this.setScrollbar()
    this.$body.addClass('modal-open')

    this.escape()
    this.resize()

    this.$element.on('click.dismiss.bs.modal', '[data-dismiss="modal"]', $.proxy(this.hide, this))

    this.$dialog.on('mousedown.dismiss.bs.modal', function () {
      that.$element.one('mouseup.dismiss.bs.modal', function (e) {
        if ($(e.target).is(that.$element)) that.ignoreBackdropClick = true
      })
    })

    this.backdrop(function () {
      var transition = $.support.transition && that.$element.hasClass('fade')

      if (!that.$element.parent().length) {
        that.$element.appendTo(that.$body) // don't move modals dom position
      }

      that.$element
        .show()
        .scrollTop(0)

      that.adjustDialog()

      if (transition) {
        that.$element[0].offsetWidth // force reflow
      }

      that.$element.addClass('in')

      that.enforceFocus()

      var e = $.Event('shown.bs.modal', { relatedTarget: _relatedTarget })

      transition ?
        that.$dialog // wait for modal to slide in
          .one('bsTransitionEnd', function () {
            that.$element.trigger('focus').trigger(e)
          })
          .emulateTransitionEnd(Modal.TRANSITION_DURATION) :
        that.$element.trigger('focus').trigger(e)
    })
  }

  Modal.prototype.hide = function (e) {
    if (e) e.preventDefault()

    e = $.Event('hide.bs.modal')

    this.$element.trigger(e)

    if (!this.isShown || e.isDefaultPrevented()) return

    this.isShown = false

    this.escape()
    this.resize()

    $(document).off('focusin.bs.modal')

    this.$element
      .removeClass('in')
      .off('click.dismiss.bs.modal')
      .off('mouseup.dismiss.bs.modal')

    this.$dialog.off('mousedown.dismiss.bs.modal')

    $.support.transition && this.$element.hasClass('fade') ?
      this.$element
        .one('bsTransitionEnd', $.proxy(this.hideModal, this))
        .emulateTransitionEnd(Modal.TRANSITION_DURATION) :
      this.hideModal()
  }

  Modal.prototype.enforceFocus = function () {
    $(document)
      .off('focusin.bs.modal') // guard against infinite focus loop
      .on('focusin.bs.modal', $.proxy(function (e) {
        if (document !== e.target &&
            this.$element[0] !== e.target &&
            !this.$element.has(e.target).length) {
          this.$element.trigger('focus')
        }
      }, this))
  }

  Modal.prototype.escape = function () {
    if (this.isShown && this.options.keyboard) {
      this.$element.on('keydown.dismiss.bs.modal', $.proxy(function (e) {
        e.which == 27 && this.hide()
      }, this))
    } else if (!this.isShown) {
      this.$element.off('keydown.dismiss.bs.modal')
    }
  }

  Modal.prototype.resize = function () {
    if (this.isShown) {
      $(window).on('resize.bs.modal', $.proxy(this.handleUpdate, this))
    } else {
      $(window).off('resize.bs.modal')
    }
  }

  Modal.prototype.hideModal = function () {
    var that = this
    this.$element.hide()
    this.backdrop(function () {
      that.$body.removeClass('modal-open')
      that.resetAdjustments()
      that.resetScrollbar()
      that.$element.trigger('hidden.bs.modal')
    })
  }

  Modal.prototype.removeBackdrop = function () {
    this.$backdrop && this.$backdrop.remove()
    this.$backdrop = null
  }

  Modal.prototype.backdrop = function (callback) {
    var that = this
    var animate = this.$element.hasClass('fade') ? 'fade' : ''

    if (this.isShown && this.options.backdrop) {
      var doAnimate = $.support.transition && animate

      this.$backdrop = $(document.createElement('div'))
        .addClass('modal-backdrop ' + animate)
        .appendTo(this.$body)

      this.$element.on('click.dismiss.bs.modal', $.proxy(function (e) {
        if (this.ignoreBackdropClick) {
          this.ignoreBackdropClick = false
          return
        }
        if (e.target !== e.currentTarget) return
        this.options.backdrop == 'static'
          ? this.$element[0].focus()
          : this.hide()
      }, this))

      if (doAnimate) this.$backdrop[0].offsetWidth // force reflow

      this.$backdrop.addClass('in')

      if (!callback) return

      doAnimate ?
        this.$backdrop
          .one('bsTransitionEnd', callback)
          .emulateTransitionEnd(Modal.BACKDROP_TRANSITION_DURATION) :
        callback()

    } else if (!this.isShown && this.$backdrop) {
      this.$backdrop.removeClass('in')

      var callbackRemove = function () {
        that.removeBackdrop()
        callback && callback()
      }
      $.support.transition && this.$element.hasClass('fade') ?
        this.$backdrop
          .one('bsTransitionEnd', callbackRemove)
          .emulateTransitionEnd(Modal.BACKDROP_TRANSITION_DURATION) :
        callbackRemove()

    } else if (callback) {
      callback()
    }
  }

  // these following methods are used to handle overflowing modals

  Modal.prototype.handleUpdate = function () {
    this.adjustDialog()
  }

  Modal.prototype.adjustDialog = function () {
    var modalIsOverflowing = this.$element[0].scrollHeight > document.documentElement.clientHeight

    this.$element.css({
      paddingLeft:  !this.bodyIsOverflowing && modalIsOverflowing ? this.scrollbarWidth : '',
      paddingRight: this.bodyIsOverflowing && !modalIsOverflowing ? this.scrollbarWidth : ''
    })
  }

  Modal.prototype.resetAdjustments = function () {
    this.$element.css({
      paddingLeft: '',
      paddingRight: ''
    })
  }

  Modal.prototype.checkScrollbar = function () {
    var fullWindowWidth = window.innerWidth
    if (!fullWindowWidth) { // workaround for missing window.innerWidth in IE8
      var documentElementRect = document.documentElement.getBoundingClientRect()
      fullWindowWidth = documentElementRect.right - Math.abs(documentElementRect.left)
    }
    this.bodyIsOverflowing = document.body.clientWidth < fullWindowWidth
    this.scrollbarWidth = this.measureScrollbar()
  }

  Modal.prototype.setScrollbar = function () {
    var bodyPad = parseInt((this.$body.css('padding-right') || 0), 10)
    this.originalBodyPad = document.body.style.paddingRight || ''
    if (this.bodyIsOverflowing) this.$body.css('padding-right', bodyPad + this.scrollbarWidth)
  }

  Modal.prototype.resetScrollbar = function () {
    this.$body.css('padding-right', this.originalBodyPad)
  }

  Modal.prototype.measureScrollbar = function () { // thx walsh
    var scrollDiv = document.createElement('div')
    scrollDiv.className = 'modal-scrollbar-measure'
    this.$body.append(scrollDiv)
    var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth
    this.$body[0].removeChild(scrollDiv)
    return scrollbarWidth
  }


  // MODAL PLUGIN DEFINITION
  // =======================

  function Plugin(option, _relatedTarget) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.modal')
      var options = $.extend({}, Modal.DEFAULTS, $this.data(), typeof option == 'object' && option)

      if (!data) $this.data('bs.modal', (data = new Modal(this, options)))
      if (typeof option == 'string') data[option](_relatedTarget)
      else if (options.show) data.show(_relatedTarget)
    })
  }

  var old = $.fn.modal

  $.fn.modal             = Plugin
  $.fn.modal.Constructor = Modal


  // MODAL NO CONFLICT
  // =================

  $.fn.modal.noConflict = function () {
    $.fn.modal = old
    return this
  }


  // MODAL DATA-API
  // ==============

  $(document).on('click.bs.modal.data-api', '[data-toggle="modal"]', function (e) {
    var $this   = $(this)
    var href    = $this.attr('href')
    var $target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))) // strip for ie7
    var option  = $target.data('bs.modal') ? 'toggle' : $.extend({ remote: !/#/.test(href) && href }, $target.data(), $this.data())

    if ($this.is('a')) e.preventDefault()

    $target.one('show.bs.modal', function (showEvent) {
      if (showEvent.isDefaultPrevented()) return // only register focus restorer if modal will actually get shown
      $target.one('hidden.bs.modal', function () {
        $this.is(':visible') && $this.trigger('focus')
      })
    })
    Plugin.call($target, option, this)
  })

}(jQuery);

},{}],12:[function(require,module,exports){
/* ========================================================================
 * Bootstrap: popover.js v3.3.7
 * http://getbootstrap.com/javascript/#popovers
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // POPOVER PUBLIC CLASS DEFINITION
  // ===============================

  var Popover = function (element, options) {
    this.init('popover', element, options)
  }

  if (!$.fn.tooltip) throw new Error('Popover requires tooltip.js')

  Popover.VERSION  = '3.3.7'

  Popover.DEFAULTS = $.extend({}, $.fn.tooltip.Constructor.DEFAULTS, {
    placement: 'right',
    trigger: 'click',
    content: '',
    template: '<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'
  })


  // NOTE: POPOVER EXTENDS tooltip.js
  // ================================

  Popover.prototype = $.extend({}, $.fn.tooltip.Constructor.prototype)

  Popover.prototype.constructor = Popover

  Popover.prototype.getDefaults = function () {
    return Popover.DEFAULTS
  }

  Popover.prototype.setContent = function () {
    var $tip    = this.tip()
    var title   = this.getTitle()
    var content = this.getContent()

    $tip.find('.popover-title')[this.options.html ? 'html' : 'text'](title)
    $tip.find('.popover-content').children().detach().end()[ // we use append for html objects to maintain js events
      this.options.html ? (typeof content == 'string' ? 'html' : 'append') : 'text'
    ](content)

    $tip.removeClass('fade top bottom left right in')

    // IE8 doesn't accept hiding via the `:empty` pseudo selector, we have to do
    // this manually by checking the contents.
    if (!$tip.find('.popover-title').html()) $tip.find('.popover-title').hide()
  }

  Popover.prototype.hasContent = function () {
    return this.getTitle() || this.getContent()
  }

  Popover.prototype.getContent = function () {
    var $e = this.$element
    var o  = this.options

    return $e.attr('data-content')
      || (typeof o.content == 'function' ?
            o.content.call($e[0]) :
            o.content)
  }

  Popover.prototype.arrow = function () {
    return (this.$arrow = this.$arrow || this.tip().find('.arrow'))
  }


  // POPOVER PLUGIN DEFINITION
  // =========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.popover')
      var options = typeof option == 'object' && option

      if (!data && /destroy|hide/.test(option)) return
      if (!data) $this.data('bs.popover', (data = new Popover(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.popover

  $.fn.popover             = Plugin
  $.fn.popover.Constructor = Popover


  // POPOVER NO CONFLICT
  // ===================

  $.fn.popover.noConflict = function () {
    $.fn.popover = old
    return this
  }

}(jQuery);

},{}],13:[function(require,module,exports){
/* ========================================================================
 * Bootstrap: scrollspy.js v3.3.7
 * http://getbootstrap.com/javascript/#scrollspy
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // SCROLLSPY CLASS DEFINITION
  // ==========================

  function ScrollSpy(element, options) {
    this.$body          = $(document.body)
    this.$scrollElement = $(element).is(document.body) ? $(window) : $(element)
    this.options        = $.extend({}, ScrollSpy.DEFAULTS, options)
    this.selector       = (this.options.target || '') + ' .nav li > a'
    this.offsets        = []
    this.targets        = []
    this.activeTarget   = null
    this.scrollHeight   = 0

    this.$scrollElement.on('scroll.bs.scrollspy', $.proxy(this.process, this))
    this.refresh()
    this.process()
  }

  ScrollSpy.VERSION  = '3.3.7'

  ScrollSpy.DEFAULTS = {
    offset: 10
  }

  ScrollSpy.prototype.getScrollHeight = function () {
    return this.$scrollElement[0].scrollHeight || Math.max(this.$body[0].scrollHeight, document.documentElement.scrollHeight)
  }

  ScrollSpy.prototype.refresh = function () {
    var that          = this
    var offsetMethod  = 'offset'
    var offsetBase    = 0

    this.offsets      = []
    this.targets      = []
    this.scrollHeight = this.getScrollHeight()

    if (!$.isWindow(this.$scrollElement[0])) {
      offsetMethod = 'position'
      offsetBase   = this.$scrollElement.scrollTop()
    }

    this.$body
      .find(this.selector)
      .map(function () {
        var $el   = $(this)
        var href  = $el.data('target') || $el.attr('href')
        var $href = /^#./.test(href) && $(href)

        return ($href
          && $href.length
          && $href.is(':visible')
          && [[$href[offsetMethod]().top + offsetBase, href]]) || null
      })
      .sort(function (a, b) { return a[0] - b[0] })
      .each(function () {
        that.offsets.push(this[0])
        that.targets.push(this[1])
      })
  }

  ScrollSpy.prototype.process = function () {
    var scrollTop    = this.$scrollElement.scrollTop() + this.options.offset
    var scrollHeight = this.getScrollHeight()
    var maxScroll    = this.options.offset + scrollHeight - this.$scrollElement.height()
    var offsets      = this.offsets
    var targets      = this.targets
    var activeTarget = this.activeTarget
    var i

    if (this.scrollHeight != scrollHeight) {
      this.refresh()
    }

    if (scrollTop >= maxScroll) {
      return activeTarget != (i = targets[targets.length - 1]) && this.activate(i)
    }

    if (activeTarget && scrollTop < offsets[0]) {
      this.activeTarget = null
      return this.clear()
    }

    for (i = offsets.length; i--;) {
      activeTarget != targets[i]
        && scrollTop >= offsets[i]
        && (offsets[i + 1] === undefined || scrollTop < offsets[i + 1])
        && this.activate(targets[i])
    }
  }

  ScrollSpy.prototype.activate = function (target) {
    this.activeTarget = target

    this.clear()

    var selector = this.selector +
      '[data-target="' + target + '"],' +
      this.selector + '[href="' + target + '"]'

    var active = $(selector)
      .parents('li')
      .addClass('active')

    if (active.parent('.dropdown-menu').length) {
      active = active
        .closest('li.dropdown')
        .addClass('active')
    }

    active.trigger('activate.bs.scrollspy')
  }

  ScrollSpy.prototype.clear = function () {
    $(this.selector)
      .parentsUntil(this.options.target, '.active')
      .removeClass('active')
  }


  // SCROLLSPY PLUGIN DEFINITION
  // ===========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.scrollspy')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.scrollspy', (data = new ScrollSpy(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.scrollspy

  $.fn.scrollspy             = Plugin
  $.fn.scrollspy.Constructor = ScrollSpy


  // SCROLLSPY NO CONFLICT
  // =====================

  $.fn.scrollspy.noConflict = function () {
    $.fn.scrollspy = old
    return this
  }


  // SCROLLSPY DATA-API
  // ==================

  $(window).on('load.bs.scrollspy.data-api', function () {
    $('[data-spy="scroll"]').each(function () {
      var $spy = $(this)
      Plugin.call($spy, $spy.data())
    })
  })

}(jQuery);

},{}],14:[function(require,module,exports){
/* ========================================================================
 * Bootstrap: tab.js v3.3.7
 * http://getbootstrap.com/javascript/#tabs
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // TAB CLASS DEFINITION
  // ====================

  var Tab = function (element) {
    // jscs:disable requireDollarBeforejQueryAssignment
    this.element = $(element)
    // jscs:enable requireDollarBeforejQueryAssignment
  }

  Tab.VERSION = '3.3.7'

  Tab.TRANSITION_DURATION = 150

  Tab.prototype.show = function () {
    var $this    = this.element
    var $ul      = $this.closest('ul:not(.dropdown-menu)')
    var selector = $this.data('target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
    }

    if ($this.parent('li').hasClass('active')) return

    var $previous = $ul.find('.active:last a')
    var hideEvent = $.Event('hide.bs.tab', {
      relatedTarget: $this[0]
    })
    var showEvent = $.Event('show.bs.tab', {
      relatedTarget: $previous[0]
    })

    $previous.trigger(hideEvent)
    $this.trigger(showEvent)

    if (showEvent.isDefaultPrevented() || hideEvent.isDefaultPrevented()) return

    var $target = $(selector)

    this.activate($this.closest('li'), $ul)
    this.activate($target, $target.parent(), function () {
      $previous.trigger({
        type: 'hidden.bs.tab',
        relatedTarget: $this[0]
      })
      $this.trigger({
        type: 'shown.bs.tab',
        relatedTarget: $previous[0]
      })
    })
  }

  Tab.prototype.activate = function (element, container, callback) {
    var $active    = container.find('> .active')
    var transition = callback
      && $.support.transition
      && ($active.length && $active.hasClass('fade') || !!container.find('> .fade').length)

    function next() {
      $active
        .removeClass('active')
        .find('> .dropdown-menu > .active')
          .removeClass('active')
        .end()
        .find('[data-toggle="tab"]')
          .attr('aria-expanded', false)

      element
        .addClass('active')
        .find('[data-toggle="tab"]')
          .attr('aria-expanded', true)

      if (transition) {
        element[0].offsetWidth // reflow for transition
        element.addClass('in')
      } else {
        element.removeClass('fade')
      }

      if (element.parent('.dropdown-menu').length) {
        element
          .closest('li.dropdown')
            .addClass('active')
          .end()
          .find('[data-toggle="tab"]')
            .attr('aria-expanded', true)
      }

      callback && callback()
    }

    $active.length && transition ?
      $active
        .one('bsTransitionEnd', next)
        .emulateTransitionEnd(Tab.TRANSITION_DURATION) :
      next()

    $active.removeClass('in')
  }


  // TAB PLUGIN DEFINITION
  // =====================

  function Plugin(option) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.tab')

      if (!data) $this.data('bs.tab', (data = new Tab(this)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.tab

  $.fn.tab             = Plugin
  $.fn.tab.Constructor = Tab


  // TAB NO CONFLICT
  // ===============

  $.fn.tab.noConflict = function () {
    $.fn.tab = old
    return this
  }


  // TAB DATA-API
  // ============

  var clickHandler = function (e) {
    e.preventDefault()
    Plugin.call($(this), 'show')
  }

  $(document)
    .on('click.bs.tab.data-api', '[data-toggle="tab"]', clickHandler)
    .on('click.bs.tab.data-api', '[data-toggle="pill"]', clickHandler)

}(jQuery);

},{}],15:[function(require,module,exports){
/* ========================================================================
 * Bootstrap: tooltip.js v3.3.7
 * http://getbootstrap.com/javascript/#tooltip
 * Inspired by the original jQuery.tipsy by Jason Frame
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // TOOLTIP PUBLIC CLASS DEFINITION
  // ===============================

  var Tooltip = function (element, options) {
    this.type       = null
    this.options    = null
    this.enabled    = null
    this.timeout    = null
    this.hoverState = null
    this.$element   = null
    this.inState    = null

    this.init('tooltip', element, options)
  }

  Tooltip.VERSION  = '3.3.7'

  Tooltip.TRANSITION_DURATION = 150

  Tooltip.DEFAULTS = {
    animation: true,
    placement: 'top',
    selector: false,
    template: '<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
    trigger: 'hover focus',
    title: '',
    delay: 0,
    html: false,
    container: false,
    viewport: {
      selector: 'body',
      padding: 0
    }
  }

  Tooltip.prototype.init = function (type, element, options) {
    this.enabled   = true
    this.type      = type
    this.$element  = $(element)
    this.options   = this.getOptions(options)
    this.$viewport = this.options.viewport && $($.isFunction(this.options.viewport) ? this.options.viewport.call(this, this.$element) : (this.options.viewport.selector || this.options.viewport))
    this.inState   = { click: false, hover: false, focus: false }

    if (this.$element[0] instanceof document.constructor && !this.options.selector) {
      throw new Error('`selector` option must be specified when initializing ' + this.type + ' on the window.document object!')
    }

    var triggers = this.options.trigger.split(' ')

    for (var i = triggers.length; i--;) {
      var trigger = triggers[i]

      if (trigger == 'click') {
        this.$element.on('click.' + this.type, this.options.selector, $.proxy(this.toggle, this))
      } else if (trigger != 'manual') {
        var eventIn  = trigger == 'hover' ? 'mouseenter' : 'focusin'
        var eventOut = trigger == 'hover' ? 'mouseleave' : 'focusout'

        this.$element.on(eventIn  + '.' + this.type, this.options.selector, $.proxy(this.enter, this))
        this.$element.on(eventOut + '.' + this.type, this.options.selector, $.proxy(this.leave, this))
      }
    }

    this.options.selector ?
      (this._options = $.extend({}, this.options, { trigger: 'manual', selector: '' })) :
      this.fixTitle()
  }

  Tooltip.prototype.getDefaults = function () {
    return Tooltip.DEFAULTS
  }

  Tooltip.prototype.getOptions = function (options) {
    options = $.extend({}, this.getDefaults(), this.$element.data(), options)

    if (options.delay && typeof options.delay == 'number') {
      options.delay = {
        show: options.delay,
        hide: options.delay
      }
    }

    return options
  }

  Tooltip.prototype.getDelegateOptions = function () {
    var options  = {}
    var defaults = this.getDefaults()

    this._options && $.each(this._options, function (key, value) {
      if (defaults[key] != value) options[key] = value
    })

    return options
  }

  Tooltip.prototype.enter = function (obj) {
    var self = obj instanceof this.constructor ?
      obj : $(obj.currentTarget).data('bs.' + this.type)

    if (!self) {
      self = new this.constructor(obj.currentTarget, this.getDelegateOptions())
      $(obj.currentTarget).data('bs.' + this.type, self)
    }

    if (obj instanceof $.Event) {
      self.inState[obj.type == 'focusin' ? 'focus' : 'hover'] = true
    }

    if (self.tip().hasClass('in') || self.hoverState == 'in') {
      self.hoverState = 'in'
      return
    }

    clearTimeout(self.timeout)

    self.hoverState = 'in'

    if (!self.options.delay || !self.options.delay.show) return self.show()

    self.timeout = setTimeout(function () {
      if (self.hoverState == 'in') self.show()
    }, self.options.delay.show)
  }

  Tooltip.prototype.isInStateTrue = function () {
    for (var key in this.inState) {
      if (this.inState[key]) return true
    }

    return false
  }

  Tooltip.prototype.leave = function (obj) {
    var self = obj instanceof this.constructor ?
      obj : $(obj.currentTarget).data('bs.' + this.type)

    if (!self) {
      self = new this.constructor(obj.currentTarget, this.getDelegateOptions())
      $(obj.currentTarget).data('bs.' + this.type, self)
    }

    if (obj instanceof $.Event) {
      self.inState[obj.type == 'focusout' ? 'focus' : 'hover'] = false
    }

    if (self.isInStateTrue()) return

    clearTimeout(self.timeout)

    self.hoverState = 'out'

    if (!self.options.delay || !self.options.delay.hide) return self.hide()

    self.timeout = setTimeout(function () {
      if (self.hoverState == 'out') self.hide()
    }, self.options.delay.hide)
  }

  Tooltip.prototype.show = function () {
    var e = $.Event('show.bs.' + this.type)

    if (this.hasContent() && this.enabled) {
      this.$element.trigger(e)

      var inDom = $.contains(this.$element[0].ownerDocument.documentElement, this.$element[0])
      if (e.isDefaultPrevented() || !inDom) return
      var that = this

      var $tip = this.tip()

      var tipId = this.getUID(this.type)

      this.setContent()
      $tip.attr('id', tipId)
      this.$element.attr('aria-describedby', tipId)

      if (this.options.animation) $tip.addClass('fade')

      var placement = typeof this.options.placement == 'function' ?
        this.options.placement.call(this, $tip[0], this.$element[0]) :
        this.options.placement

      var autoToken = /\s?auto?\s?/i
      var autoPlace = autoToken.test(placement)
      if (autoPlace) placement = placement.replace(autoToken, '') || 'top'

      $tip
        .detach()
        .css({ top: 0, left: 0, display: 'block' })
        .addClass(placement)
        .data('bs.' + this.type, this)

      this.options.container ? $tip.appendTo(this.options.container) : $tip.insertAfter(this.$element)
      this.$element.trigger('inserted.bs.' + this.type)

      var pos          = this.getPosition()
      var actualWidth  = $tip[0].offsetWidth
      var actualHeight = $tip[0].offsetHeight

      if (autoPlace) {
        var orgPlacement = placement
        var viewportDim = this.getPosition(this.$viewport)

        placement = placement == 'bottom' && pos.bottom + actualHeight > viewportDim.bottom ? 'top'    :
                    placement == 'top'    && pos.top    - actualHeight < viewportDim.top    ? 'bottom' :
                    placement == 'right'  && pos.right  + actualWidth  > viewportDim.width  ? 'left'   :
                    placement == 'left'   && pos.left   - actualWidth  < viewportDim.left   ? 'right'  :
                    placement

        $tip
          .removeClass(orgPlacement)
          .addClass(placement)
      }

      var calculatedOffset = this.getCalculatedOffset(placement, pos, actualWidth, actualHeight)

      this.applyPlacement(calculatedOffset, placement)

      var complete = function () {
        var prevHoverState = that.hoverState
        /**
         * start
         * 2018-4-16 增加that.$element不为空的判断
         */
        if (that.$element) {
            that.$element.trigger('shown.bs.' + that.type)
        }
        /**
         * end
         */
        that.hoverState = null

        if (prevHoverState == 'out') that.leave(that)
      }

      $.support.transition && this.$tip.hasClass('fade') ?
        $tip
          .one('bsTransitionEnd', complete)
          .emulateTransitionEnd(Tooltip.TRANSITION_DURATION) :
        complete()
    }
  }

  Tooltip.prototype.applyPlacement = function (offset, placement) {
    var $tip   = this.tip()
    var width  = $tip[0].offsetWidth
    var height = $tip[0].offsetHeight

    // manually read margins because getBoundingClientRect includes difference
    var marginTop = parseInt($tip.css('margin-top'), 10)
    var marginLeft = parseInt($tip.css('margin-left'), 10)

    // we must check for NaN for ie 8/9
    if (isNaN(marginTop))  marginTop  = 0
    if (isNaN(marginLeft)) marginLeft = 0

    offset.top  += marginTop
    offset.left += marginLeft

    // $.fn.offset doesn't round pixel values
    // so we use setOffset directly with our own function B-0
    $.offset.setOffset($tip[0], $.extend({
      using: function (props) {
        $tip.css({
          top: Math.round(props.top),
          left: Math.round(props.left)
        })
      }
    }, offset), 0)

    $tip.addClass('in')

    // check to see if placing tip in new offset caused the tip to resize itself
    var actualWidth  = $tip[0].offsetWidth
    var actualHeight = $tip[0].offsetHeight

    if (placement == 'top' && actualHeight != height) {
      offset.top = offset.top + height - actualHeight
    }

    var delta = this.getViewportAdjustedDelta(placement, offset, actualWidth, actualHeight)

    if (delta.left) offset.left += delta.left
    else offset.top += delta.top

    var isVertical          = /top|bottom/.test(placement)
    var arrowDelta          = isVertical ? delta.left * 2 - width + actualWidth : delta.top * 2 - height + actualHeight
    var arrowOffsetPosition = isVertical ? 'offsetWidth' : 'offsetHeight'

    $tip.offset(offset)
    this.replaceArrow(arrowDelta, $tip[0][arrowOffsetPosition], isVertical)
  }

  Tooltip.prototype.replaceArrow = function (delta, dimension, isVertical) {
    this.arrow()
      .css(isVertical ? 'left' : 'top', 50 * (1 - delta / dimension) + '%')
      .css(isVertical ? 'top' : 'left', '')
  }

  Tooltip.prototype.setContent = function () {
    var $tip  = this.tip()
    var title = this.getTitle()

    $tip.find('.tooltip-inner')[this.options.html ? 'html' : 'text'](title)
    $tip.removeClass('fade in top bottom left right')
  }

  Tooltip.prototype.hide = function (callback) {
    var that = this
    var $tip = $(this.$tip)
    var e    = $.Event('hide.bs.' + this.type)

    function complete() {
      if (that.hoverState != 'in') $tip.detach()
      if (that.$element) { // TODO: Check whether guarding this code with this `if` is really necessary.
        that.$element
          .removeAttr('aria-describedby')
          .trigger('hidden.bs.' + that.type)
      }
      callback && callback()
    }

    this.$element.trigger(e)

    if (e.isDefaultPrevented()) return

    $tip.removeClass('in')

    $.support.transition && $tip.hasClass('fade') ?
      $tip
        .one('bsTransitionEnd', complete)
        .emulateTransitionEnd(Tooltip.TRANSITION_DURATION) :
      complete()

    this.hoverState = null

    return this
  }

  Tooltip.prototype.fixTitle = function () {
    var $e = this.$element
    if ($e.attr('title') || typeof $e.attr('data-original-title') != 'string') {
      $e.attr('data-original-title', $e.attr('title') || '').attr('title', '')
    }
  }

  Tooltip.prototype.hasContent = function () {
    return this.getTitle()
  }

  Tooltip.prototype.getPosition = function ($element) {
    $element   = $element || this.$element

    var el     = $element[0]
    var isBody = el.tagName == 'BODY'

    var elRect    = el.getBoundingClientRect()
    if (elRect.width == null) {
      // width and height are missing in IE8, so compute them manually; see https://github.com/twbs/bootstrap/issues/14093
      elRect = $.extend({}, elRect, { width: elRect.right - elRect.left, height: elRect.bottom - elRect.top })
    }
    var isSvg = window.SVGElement && el instanceof window.SVGElement
    // Avoid using $.offset() on SVGs since it gives incorrect results in jQuery 3.
    // See https://github.com/twbs/bootstrap/issues/20280
    var elOffset  = isBody ? { top: 0, left: 0 } : (isSvg ? null : $element.offset())
    var scroll    = { scroll: isBody ? document.documentElement.scrollTop || document.body.scrollTop : $element.scrollTop() }
    var outerDims = isBody ? { width: $(window).width(), height: $(window).height() } : null

    return $.extend({}, elRect, scroll, outerDims, elOffset)
  }

  Tooltip.prototype.getCalculatedOffset = function (placement, pos, actualWidth, actualHeight) {
    return placement == 'bottom' ? { top: pos.top + pos.height,   left: pos.left + pos.width / 2 - actualWidth / 2 } :
           placement == 'top'    ? { top: pos.top - actualHeight, left: pos.left + pos.width / 2 - actualWidth / 2 } :
           placement == 'left'   ? { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth } :
        /* placement == 'right' */ { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width }

  }

  Tooltip.prototype.getViewportAdjustedDelta = function (placement, pos, actualWidth, actualHeight) {
    var delta = { top: 0, left: 0 }
    if (!this.$viewport) return delta

    var viewportPadding = this.options.viewport && this.options.viewport.padding || 0
    var viewportDimensions = this.getPosition(this.$viewport)

    if (/right|left/.test(placement)) {
      var topEdgeOffset    = pos.top - viewportPadding - viewportDimensions.scroll
      var bottomEdgeOffset = pos.top + viewportPadding - viewportDimensions.scroll + actualHeight
      if (topEdgeOffset < viewportDimensions.top) { // top overflow
        delta.top = viewportDimensions.top - topEdgeOffset
      } else if (bottomEdgeOffset > viewportDimensions.top + viewportDimensions.height) { // bottom overflow
        delta.top = viewportDimensions.top + viewportDimensions.height - bottomEdgeOffset
      }
    } else {
      var leftEdgeOffset  = pos.left - viewportPadding
      var rightEdgeOffset = pos.left + viewportPadding + actualWidth
      if (leftEdgeOffset < viewportDimensions.left) { // left overflow
        delta.left = viewportDimensions.left - leftEdgeOffset
      } else if (rightEdgeOffset > viewportDimensions.right) { // right overflow
        delta.left = viewportDimensions.left + viewportDimensions.width - rightEdgeOffset
      }
    }

    return delta
  }

  Tooltip.prototype.getTitle = function () {
    var title
    var $e = this.$element
    var o  = this.options

    title = $e.attr('data-original-title')
      || (typeof o.title == 'function' ? o.title.call($e[0]) :  o.title)

    return title
  }

  Tooltip.prototype.getUID = function (prefix) {
    do prefix += ~~(Math.random() * 1000000)
    while (document.getElementById(prefix))
    return prefix
  }

  Tooltip.prototype.tip = function () {
    if (!this.$tip) {
      this.$tip = $(this.options.template)
      if (this.$tip.length != 1) {
        throw new Error(this.type + ' `template` option must consist of exactly 1 top-level element!')
      }
    }
    return this.$tip
  }

  Tooltip.prototype.arrow = function () {
    return (this.$arrow = this.$arrow || this.tip().find('.tooltip-arrow'))
  }

  Tooltip.prototype.enable = function () {
    this.enabled = true
  }

  Tooltip.prototype.disable = function () {
    this.enabled = false
  }

  Tooltip.prototype.toggleEnabled = function () {
    this.enabled = !this.enabled
  }

  Tooltip.prototype.toggle = function (e) {
    var self = this
    if (e) {
      self = $(e.currentTarget).data('bs.' + this.type)
      if (!self) {
        self = new this.constructor(e.currentTarget, this.getDelegateOptions())
        $(e.currentTarget).data('bs.' + this.type, self)
      }
    }

    if (e) {
      self.inState.click = !self.inState.click
      if (self.isInStateTrue()) self.enter(self)
      else self.leave(self)
    } else {
      self.tip().hasClass('in') ? self.leave(self) : self.enter(self)
    }
  }

  Tooltip.prototype.destroy = function () {
    var that = this
    clearTimeout(this.timeout)
    this.hide(function () {
        /**
         * start
         * 2018-4-16 增加that.$element不为空的判断
         */
       if (that.$element) {
            that.$element.off('.' + that.type).removeData('bs.' + that.type)
       } 
        /**
         * end
         */     
      if (that.$tip) {
        that.$tip.detach()
      }
      that.$tip = null
      that.$arrow = null
      that.$viewport = null
      that.$element = null
    })
  }


  // TOOLTIP PLUGIN DEFINITION
  // =========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.tooltip')
      var options = typeof option == 'object' && option

      if (!data && /destroy|hide/.test(option)) return
      if (!data) $this.data('bs.tooltip', (data = new Tooltip(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.tooltip

  $.fn.tooltip             = Plugin
  $.fn.tooltip.Constructor = Tooltip


  // TOOLTIP NO CONFLICT
  // ===================

  $.fn.tooltip.noConflict = function () {
    $.fn.tooltip = old
    return this
  }

}(jQuery);

},{}],16:[function(require,module,exports){
/* ========================================================================
 * Bootstrap: transition.js v3.3.7
 * http://getbootstrap.com/javascript/#transitions
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // CSS TRANSITION SUPPORT (Shoutout: http://www.modernizr.com/)
  // ============================================================

  function transitionEnd() {
    var el = document.createElement('bootstrap')

    var transEndEventNames = {
      WebkitTransition : 'webkitTransitionEnd',
      MozTransition    : 'transitionend',
      OTransition      : 'oTransitionEnd otransitionend',
      transition       : 'transitionend'
    }

    for (var name in transEndEventNames) {
      if (el.style[name] !== undefined) {
        return { end: transEndEventNames[name] }
      }
    }

    return false // explicit for ie8 (  ._.)
  }

  // http://blog.alexmaccaw.com/css-transitions
  $.fn.emulateTransitionEnd = function (duration) {
    var called = false
    var $el = this
    $(this).one('bsTransitionEnd', function () { called = true })
    var callback = function () { if (!called) $($el).trigger($.support.transition.end) }
    setTimeout(callback, duration)
    return this
  }

  $(function () {
    $.support.transition = transitionEnd()

    if (!$.support.transition) return

    $.event.special.bsTransitionEnd = {
      bindType: $.support.transition.end,
      delegateType: $.support.transition.end,
      handle: function (e) {
        if ($(e.target).is(this)) return e.handleObj.handler.apply(this, arguments)
      }
    }
  })

}(jQuery);

},{}],17:[function(require,module,exports){
/**
 * fhui v0.0.1
 */

// boostrap
require("./bootstrap/javascripts/bootstrap");

// ecology
require("./bootstrap-extend/ecology/pagin/index");
require("./bootstrap-extend/ecology/dialog/index");
},{"./bootstrap-extend/ecology/dialog/index":1,"./bootstrap-extend/ecology/pagin/index":2,"./bootstrap/javascripts/bootstrap":3}]},{},[17])(17)
});