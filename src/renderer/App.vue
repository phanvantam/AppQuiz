<template>
    <div id="app" class="window">
        <!-- .toolbar-header sits at the top of your app -->
        <header class="toolbar toolbar-header">
            <h1 class="title">{{ title }}</h1>
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
                        <router-link to="/system/config" class="nav-group-item">
                            <span class="icon icon-cog"></span>
                            Cài đặt
                        </router-link>
                        <router-link to="/system/info" class="nav-group-item">
                            <span class="icon icon-info-circled"></span>
                            Thông tin
                        </router-link>
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
    data: ()=>({
        title: 'AppQuiz'
    }),
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
                case 4:
                type = 'Export'
                break
                case 5:
                type = 'Import'
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
        },
        setTitle(v){
            this.title = v
        },
        saveFile(data, filename=null) {
            const fs = require('fs');
            if(!fs.existsSync(`${this.$dataPath}/media`)) fs.mkdir(`${this.$dataPath}/media`)
            try { 
                filename = filename != null ? filename : Date.now() +'_'+ Math.floor(Math.random() * 500) 
                fs.writeFileSync(`${this.$dataPath}/media/${filename}.txt`, data, 'utf-8')
                return filename
            } catch(e) {
                alert('Hệ thống phát sinh lỗi, vui lòng báo lại nhà phát triển!') 
                return null
            }
        },
        readFile(filename) {
            const fs = require('fs');
            try {
                return fs.readFileSync(`${this.$dataPath}/media/${filename}.txt`, 'utf-8');
            } catch(e) {
                return null
            }
        },
        removeFile(filename) {
            const fs = require('fs');
            fs.unlink(`${this.$dataPath}/media/${filename}.txt`, function (err) {
                if(err) {
                    return false
                }
                return true
            });
        }
    }
}
</script>
<style>
/* CSS */
@import url("~@/assets/css/photon.min.css");
@import url("~@/assets/css/style.css");
</style>