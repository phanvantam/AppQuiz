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
                        <router-link to="/threads/listing" class="nav-group-item">
                            <span class="icon icon-book"></span>
                            Danh sách đề
                        </router-link>
                        <router-link to="/system/log" class="nav-group-item">
                            <span class="icon icon-back-in-time"></span>
                            Lịch sử
                        </router-link>
                        <span class="nav-group-item">
                            <span class="icon icon-cog"></span>
                            Cài đặt
                        </span>
                        <span class="nav-group-item">
                            <span class="icon icon-info-circled"></span>
                            Thông tin
                        </span>
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
    name: 'AppQuiz',
    methods: {
        writeLog(type, record_id, note) {
            switch(type) {
                case 1:
                type = 'Thêm mới'
                break
                case 2:
                type = 'Cập nhật'
                break
                case 3:
                type = 'Xóa bỏ'
                break
            }
            const os = require('os')
            let timestamp = Date.now();
            var data_insert = {
                record_id: record_id,
                type: type,
                note: note,
                created_at: os.userInfo().username,
                created_time: timestamp,
            }
            this.$db.Logs.insert(data_insert)
        }
    }
}
</script>
<style>
/* CSS */
@import url("~@/assets/css/photon.min.css");
@import url("~@/assets/css/style.css");
</style>