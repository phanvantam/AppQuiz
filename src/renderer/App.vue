<template>
    <div id="app" class="window">
        <!-- .toolbar-header sits at the top of your app -->
        <header class="toolbar toolbar-header">
            <h1 class="title">Header with actions</h1>
        </header>
        <!-- Your app's content goes inside .window-content -->
        <div class="window-content">
            <div class="pane-group">
                <div class="pane pane-sm sidebar">
                    <nav class="nav-group">
                <!--         <router-link to="/form" class="nav-group-item">
                            <span class="icon icon-home"></span>
                            Trang chủ
                        </router-link> -->
                        <router-link to="/threads/listing" class="nav-group-item">
                            <span class="icon icon-book"></span>
                            Danh sách đề
                        </router-link>
                        <span class="nav-group-item">
                            <span class="icon icon-cog"></span>
                            Cài đặt
                        </span>
                        <span class="nav-group-item">
                            <span class="icon icon-back-in-time"></span>
                            Lịch sử
                        </span>
                        <span class="nav-group-item">
                            <span class="icon icon-info-circled"></span>
                            Thông tin
                        </span>
                        <!-- <h5 class="nav-group-title">Mẫu giao diện</h5>
                        <router-link to="/listing" class="nav-group-item">
                            <span class="icon icon-cc-share"></span>
                            Listing
                        </router-link>
                        <router-link to="/form" class="nav-group-item">
                            <span class="icon icon-cc-share"></span>
                            Form
                        </router-link>
                        <router-link to="/threads/create" class="nav-group-item">
                            <span class="icon icon-cc-share"></span>
                            Tạo đề
                        </router-link> -->
                    </nav>
                </div>
                <div class="pane">
                    <router-view></router-view>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
export default {
    name: 'AppQuiz'
}
</script>
<style>
/* CSS */
@import url("~@/assets/css/photon.min.css");
@import url("~@/assets/css/style.css");
</style>