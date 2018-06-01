# 180531-travelNotes  识花草分享游记
1. 单独活动页面的构建：使用gulp(包含了实时编译scss，压缩css/js功能)

2. 单页面H5横滑、竖滑js库：swipe，每个slide里可以内嵌一个slide，比如竖滑的slide里可以嵌一个横滑的【https://github.com/nolimits4web/swiper】

3. 照片墙js库：https://masonry.desandro.com/
    1. 可以不依赖其他库，在html的标签里添加data属性
        ``<div class="grid" data-masonry='{ "itemSelector": ".grid-item", "columnWidth": ".grid-sizing", "percentPosition": true, "horizontalOrder": true }'>``
    2. 必选参数：
        1. itemSelector
        2. columnWidth：栅格最小单位，可以是一个具体数值或者一个class名字，如：.grid-width1，但是这个class必须在元素上应用（可以做一个高度为0的，且class不是itemSelector的元素上，使其不影响）
    3. 做响应式的照片墙，可以用百分比的宽度单位实现
  
4. http://vanilla-js.com/ 一个很小的js库
