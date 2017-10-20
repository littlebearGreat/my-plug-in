(function ( angular ) {
	'use strict';

	var TT = {
		getPath:function(){
			var e = document.scripts,
				t = e[e.length - 1],
				i = t.src;
			if (!t.getAttribute("merge")) return i.substring(0, i.lastIndexOf("/") + 1);
		}(),
		head:function(){
			var head = document.getElementsByTagName('head')[0];
			return head;
		}(),
		adLink:function(link){
			if (TT.getPath) {
				for (var i = 0; i < link.length; i++) {
					var l = document.createElement("link");
					l.rel = "stylesheet";
					l.href = TT.getPath + link[i];
					TT.head.appendChild(l);
				};
			};
		},
		adScript:function(src){
			if (TT.getPath) {
				for (var i = 0; i < src.length; i++) {
					src[i]
					var s = document.createElement("script");
					s.src = TT.getPath + src[i];
					TT.head.appendChild(s);
				};
			};
		}
	};

	angular.module( 'listTT', [] )
	.constant('ngPaginationConfig', {
      visiblePageCount: 5,
      firstText: 'First',
      lastText: 'Last',
      prevText: 'Prev',
      nextText: 'Next',
      showIfOnePage: false,
      showFirstLastText: true,
      gotoText: 'Goto Page',
      showGoto: false
    }).directive( 'listModel', ['$compile','ngPaginationConfig', function( $compile,ngPaginationConfig) {
		return {
			restrict: 'A',
			templateUrl: TT.getPath + '../html/dom.html',
			replace : false,
			scope:{
				listModel: '=',
				setData: '=',
				pageCount: '=',
				currentPage: '=',
				onPageChange: '&',
			},
			link: function ( scope, element, attrs ) {

				console.log('666');

				// 配置参数获取
				var setData = scope.setData

				// 搜索框  开始=======================
				// 点击后提示信息消失
				var pros = true;
				scope.iptClick = function(){
					if (pros) {
						setData.searchPrompt = '';
						pros = false;
					}
				};

				// '查询'按钮
				scope.searchTT = function(){
					if (typeof setData.searchBtn == 'function') {
						if (!setData.searchPrompt || setData.searchPrompt == '请输入性别搜索') {
							alert('搜索内容不能为空');
							return false;
						};
						setData.searchBtn(setData.searchPrompt);
					}else{
						alert('请正确配置searchBtn');
					};
				};
				// 搜索框  结束=======================

				// 自添加工具栏  开始======================
				// 点击工具
				scope.toolClick = function(n){
					var ob = setData.tools[n];
					if (ob.link) {
						window.location.href = ob.link;
					}else if (typeof ob.action == 'function') {
						ob.action();
					}else{
						alert('请正确配置参数tools中的link参数或action参数');
					};
				};
				// 自添加工具栏  结束======================

				// 列表内容    开始=============================

				scope.dd = function(x,y,z){
					if(y == 'index'){
						return z;
					}else{
						return x[y];
					}
				};

				scope.operate = function(da,dat){
					if (da.link) {
						window.location.href = da.link;
					}else if (typeof da.action == 'function') {
						var data = dat;
						da.action(data);
					}else{
						alert('请正确配置参数operation中的link参数或action参数')
					};
				};

				// 列表内容    结束=============================

				// 分类点击高亮
				scope.catChecked = null;
				scope.catCheck = function(n){
					scope.catChecked = n;
				};

				// 分类点击后去执行的函数（去后台查询分类结果）
				scope.catAction = function(x){
					if (typeof setData.catClick == 'function') {
						var txt = x;
						setData.catClick(txt)
					}
				}

				// 翻页
				var visiblePageCount = angular.isDefined(setData.visiblePageCount) ? ~~setData.visiblePageCount || ngPaginationConfig.visiblePageCount : ngPaginationConfig.visiblePageCount;
				scope.firstText = angular.isDefined(setData.firstText) ? setData.firstText : ngPaginationConfig.firstText;
				scope.lastText = angular.isDefined(setData.lastText) ? setData.lastText : ngPaginationConfig.lastText;
				scope.prevText = angular.isDefined(setData.prevText) ? setData.prevText : ngPaginationConfig.prevText;
				scope.nextText = angular.isDefined(setData.nextText) ? setData.nextText : ngPaginationConfig.nextText;
				scope.showFirstLastText = angular.isDefined(setData.showFirstLastText) ? setData.showFirstLastText : ngPaginationConfig.showFirstLastText;
				scope.showIfOnePage = angular.isDefined(setData.showIfOnePage) ? setData.showIfOnePage : ngPaginationConfig.showIfOnePage;
				scope.gotoText = angular.isDefined(setData.gotoText) ? setData.gotoText : ngPaginationConfig.gotoText;
				scope.showGoto = angular.isDefined(setData.showGoto) ? setData.showGoto : ngPaginationConfig.showGoto;
				scope.currentPage = 1;

				scope.pageChange = function (page) {
					if (page >= 1 && page <= scope.pageCount) {
					  scope.currentPage = page;
					} else {
					  scope.currentPage = 1;
					}
				};

				scope.keyupHanlder = function (e) {
					var value = e.target.value;
					var parsedValue = parseInt(value, 10);
					if (!Number.isNaN(parsedValue)) {
						if (parsedValue >= 1 && parsedValue <= scope.pageCount) {

						} else if (parsedValue < 1) {
							e.target.value = 1;
						} else {
							e.target.value = scope.pageCount;
						}
						if (e.keyCode === 13) {
							// pressed enter
							scope.currentPage = parsedValue;
						}
					} else {
						if (e.preventDefault) {
							e.preventDefault();
						} else {
							return false;
						}
					}
				};

				function build() {
					var low,high,v;

					scope.pagenums = [];

					if (scope.pageCount === 0) {
						return;
					};
					if (scope.currentPage > scope.pageCount) {
						scope.currentPage = 1;
					};

					if (scope.pageCount <= visiblePageCount) {
						low = 1;
						high = scope.pageCount;
					} else {
						v = Math.ceil(visiblePageCount / 2);
						low = Math.max(scope.currentPage - v, 1);
						high = Math.min(low + visiblePageCount - 1, scope.pageCount);

						if (scope.pageCount - high < v) {
							low = high - visiblePageCount + 1;
						}
					};

					for (; low <= high; low++) {
						scope.pagenums.push(low);
					};
				};

				scope.$watch('currentPage', function (a, b) {
					if (a !== b) {
						build();
						scope.onPageChange();
					}
				});

				scope.$watch('pageCount', function (a, b) {
					if (!!a) {
						build();
					}
				});
			}
		};
	}]);
})( angular );