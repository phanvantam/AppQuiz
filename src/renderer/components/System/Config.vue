<template>
    <div class="form">
        <div class="form-group">
            <label>Nhập dữ liệu lên hệ thống</label><br />
            <input style="width: 200px;display: inline-block;margin-bottom: 8px;" type="file" class="form-control" placeholder="Email">
            <br />
            <button @click="removeLog" class="btn btn-form btn-warning">Tải lên</button>
        </div>
        <hr />
        <div class="form-group">
            <label>Xuất dữ liệu đề/câu hỏi</label><br />
            <button @click="removeLog" class="btn btn-form btn-positive">Tải xuống</button>
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
        }
    },
    created() {
        this.$options.parent.setTitle('Cấu hình hệ thống')
    }
}
</script>