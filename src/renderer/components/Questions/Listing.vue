<template>
    <div>
        <div class="toolbar-actions clearfix">
                <div class="pull-left" style="width: 70%;">
                    <input style="width: 30%" type="text" class="form-control" placeholder="Tiêu đề">
                </div>
                <div class="btn-group pull-right">
                    <router-link :to="{name: 'questions.create', params: {id: threads_id}}" class="btn btn-large btn-positive">
                        <span class="icon icon-plus"></span> Tạo câu hỏi
                    </router-link>
                </div>
            </div>
    <table class="table">
        <thead>
            <tr>
                <th>STT</th>
                <th>Tiêu đề</th>
                <th>Điểm</th>
                <th>Thời gian (m)</th>
                <th>Tạo lúc</th>
                <th>Cập nhật lúc</th>
                <th>Tác vụ</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="(row, index) in table.listing">
                <td>{{ index+1 }}</td>
                <td>{{ row.title }}</td>
                <td>{{ row.point }}</td>
                <td>{{ row.minute }}</td>
                <td>{{ formatDate(row.created_time) }}</td>
                <td>{{ formatDate(row.updated_time) }}</td>
                <td class="actions">
                    <router-link :to="{name: 'questions.update', params: {id: row._id}}"><span class="icon icon-pencil"></span></router-link>
                    <a href="#" @click="removeRecord(index)"><span class="icon icon-trash"></span></a>
                </td>
            </tr>
        </tbody>
    </table>
</div>
</template>

<script>
export default {
    data: () => ({
        threads_id: null,
        table: {
            listing: []
        },
    }),
    created() {
        this.threads_id = this.$route.params.id
        this.getData()
    },
    methods: {
        getData() {
            var _this = this
            this.$db.Questions.find({threads_id: this.threads_id}, function (err, docs) {
                _this.table.listing = docs
            });
        },
        formatDate(unix_timestamp) {
            return new Date(unix_timestamp).toISOString().slice(0, 19).replace('T', ' ')
        },
        async removeRecord(index) {
            const row = this.table.listing[index]
            if(confirm(`Xác nhận xóa "${row.title}"`)) {
                // Xóa câu hỏi, Xóa media
                let trash = {
                    media: [],
                    questions: row._id
                }
                // Lấy tất cả media đang dùng
                // Lấy media trong answer
                for(let i2 in row.answer) {
                    if('image' in row.answer[i2] && row.answer[i2].image != null) 
                        trash.media.push(row.answer[i2].image)
                }
                for(let i2 in row.questions) {
                    if(i2 !== 'type' && row.questions[i2] !== null) {
                        trash.media.push(row.questions[i2])
                    }
                }
                await this.$db.Media.asyncRemove({ _id: {$in: trash.media}}, { multi: true })
                await this.$db.Questions.asyncRemove({ _id: trash.questions})
                this.$options.parent.writeLog(3, trash.questions, `Đã xóa câu hỏi "${row.title}"`)
                this.getData()
            }
        }
    }
}
</script>