<template>
    <div class="form">
        <div class="form-group">
            <label>Nhập dữ liệu lên hệ thống</label><br />
            <input accept=".json,application/json" style="width: 200px;display: inline-block;margin-bottom: 8px;" type="file" class="form-control" id="import-data">
            <br />
            <button @click="importData" class="btn btn-form btn-warning">Tải lên</button>
        </div>
        <hr />
        <div class="form-group">
            <label>Xuất dữ liệu đề/câu hỏi</label><br />
            <button @click="exportData" class="btn btn-form btn-positive">Tải xuống</button>
        </div>
        <hr />
        <div class="form-group">
            <label>Thư mục lưu trữ tệp hình ảnh/âm thanh</label><br />
            <input class="form-control" :value="($dataPath + '/media')" />
            <p>*<i>Khi xuất dữ liệu đề cần truy cập folder trên để copy tất cả các tệp sang folder tương ứng trên máy mới</i></p>
        </div>
        <hr />
        <div class="form-group">
            <label>Xóa lịch sử thao tác của hệ thống</label><br />
            <button @click="removeLog" class="btn btn-form btn-negative">Xóa lịch sử</button>
        </div>
    </div>
</template>

<script>
export default {
    methods: {
        async removeLog() {
            if(!confirm('Xác nhận xóa lịch sử của 7 ngày trước?')) {
                return
            }
            let timestamp = Date.now()
            const time_remove = timestamp - 7*24*3600*1000
            await this.$db.Logs.asyncRemove({ created_time: {$lt: time_remove}}, { multi: true })
            this.$options.parent.writeLog(3, '', `Thực hiện xóa bỏ lịch sử trước ngày `+this.formatDate(time_remove))
            alert('Lịch sử trước ngày '+ this.formatDate(time_remove) +' đã bị xóa khỏi hệ thống!')
        },
        formatDate(unix_timestamp) {
            return new Date(unix_timestamp).toISOString().slice(0, 19).replace('T', ' ')
        },
        async exportData() {
            var isBase64 = require('is-base64')
            var threads   = await this.$db.Threads.asyncFind({})
            var questions = await this.$db.Questions.asyncFind({})
            var media     = await this.$db.Media.asyncFind({})
            // for(let i in media) {
            //     if(isBase64(media[i].base64) || !(new RegExp(/[\d]+\_[\d]+/g).test(media[i].base64))) {
            //         media[i].fileData = media[i].base64
            //         media[i].base64   = Date.now() +'_'+ Math.floor(Math.random() * 500)
            //     } else {
            //         media[i].fileData = this.$options.parent.readFile(media[i].base64)
            //     }
            // }
            const data_export = {
                threads: threads,
                questions: questions,
                media: media
            }
            var fileURL = window.URL.createObjectURL(new Blob([JSON.stringify(data_export)]));
            var fileLink = document.createElement('a');
            fileLink.href = fileURL;
            fileLink.setAttribute('download', 'AppQuiz.json');
            document.body.appendChild(fileLink);
            fileLink.click();
            this.$options.parent.writeLog(4, '', `Đã xuất dữ liệu đề/câu hỏi`)
        },
        importData() {
            const _this = this
            const files = document.getElementById('import-data').files;
            if (files.length <= 0) {
                alert('Vui lòng chọn tệp dữ liệu')
                return false;
            }

            const fr = new FileReader()

            fr.onload = async (e) => {
                const result = JSON.parse(e.target.result)
                if(!('media' in result && 'threads' in result && 'questions' in result)) {
                    alert('Tệp tải lên không hợp lệ')
                    return
                }
                for(let index in result.threads) {
                    const row = result.threads[index]
                    if(await this.$db.Threads.asyncFindOne({ _id: row._id }) == null) {
                        // Thêm bản ghi 
                        await this.$db.Threads.asyncInsert(row)
                    } else {
                        await this.$db.Threads.asyncUpdate({ _id: row._id }, row)
                    }
                    
                }
                for(let index in result.questions) {
                    const row = result.questions[index]
                    if(await this.$db.Questions.asyncFindOne({ _id: row._id }) == null) {
                        // Thêm bản ghi 
                        await this.$db.Questions.asyncInsert(row)
                    } else {
                        await this.$db.Questions.asyncUpdate({ _id: row._id }, row)
                    }
                }
                for(let index in result.media) {
                    var row = result.media[index]
                    // this.$options.parent.saveFile(row.fileData, row.base64)
                    // delete row.fileData
                    if(await this.$db.Media.asyncFindOne({ _id: row._id }) == null) {
                        // Thêm bản ghi 
                        await this.$db.Media.asyncInsert(row)
                    } else {
                        await this.$db.Media.asyncUpdate({ _id: row._id }, row)
                    }
                }
                _this.$options.parent.writeLog(5, '', `Đã nhập một tệp dữ liệu đề/câu hỏi`)
                alert("Dữ liệu được tải lên thành công")
            }
            fr.readAsText(files.item(0))
        }
    },
    created() {
        this.$options.parent.setTitle('Cấu hình hệ thống')
    }
}
</script>