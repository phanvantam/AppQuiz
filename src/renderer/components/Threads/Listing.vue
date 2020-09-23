<template>
    <div>
        <div class="toolbar-actions clearfix">
                <div class="pull-left" style="width: 70%;">
                    <input style="width: 30%" type="text" class="form-control" placeholder="Tiêu đề">
                </div>
                <div class="btn-group pull-right">
                    <router-link to="/threads/create" class="btn btn-large btn-positive">
                        <span class="icon icon-plus"></span> Tạo đề
                    </router-link>
                </div>
            </div>
    <table class="table">
        <thead>
            <tr>
                <th>STT</th>
                <th>Tiêu đề</th>
                <th>Số câu hỏi</th>
                <th>Tổng điểm</th>
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
                <td>{{ row.questions.count }}</td>
                <td>{{ row.questions.point }}</td>
                <td>{{ row.questions.minute }}</td>
                <td>{{ formatDate(row.created_time) }}</td>
                <td>{{ formatDate(row.updated_time) }}</td>
                <td class="actions">
                    <router-link :to="{name: 'questions.listing', params: {id: row._id}}"><span class="icon icon-folder"></span></router-link>
                    <router-link :to="{name: 'threads.update', params: {id: row._id}}"><span class="icon icon-pencil"></span></router-link>
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
        table: {
            listing: []
        },
    }),
    created() {
        this.getData()
    },
    methods: {
        async getData() {
            var rows = await this.$db.Threads.asyncFind({});
            for(let index in rows) {
                let questions = await this.$db.Questions.asyncFind({'threads_id': rows[index]._id})
                rows[index].questions = {}
                rows[index].questions.count = questions.length
                rows[index].questions.point = 0
                rows[index].questions.minute = 0
                for(let i in questions) {
                    rows[index].questions.point += Number(questions[i].point)
                    rows[index].questions.minute += Number(questions[i].minute)
                }
            }
            this.table.listing = rows
        },
        formatDate(unix_timestamp) {
            return new Date(unix_timestamp).toISOString().slice(0, 19).replace('T', ' ')
        },
        async removeRecord(index) {
            const row = this.table.listing[index]
            if(confirm(`Xác nhận xóa "${row.title}"`)) {
                // Xóa đề, Xóa câu hỏi, Xóa media
                let trash = {
                    media: [],
                    threads: row._id
                }
                // Lấy tất cả media đang dùng
                if(row.description.type == 1)
                    trash.media.push(row.description.image)

                const questions = await this.$db.Questions.asyncFind({'threads_id': trash.threads})
                for(let i in questions) {
                    // Lấy media trong answer
                    for(let i2 in questions[i].answer) {
                        if('image' in questions[i].answer[i2] && questions[i].answer[i2].image != null) 
                            trash.media.push(questions[i].answer[i2].image)
                    }
                    for(let i2 in questions[i].questions) {
                        if(i2 !== 'type' && questions[i].questions[i2] !== null) {
                            trash.media.push(questions[i].questions[i2])
                        }
                    }
                }
                await this.$db.Media.asyncRemove({ _id: {$in: trash.media}}, { multi: true })
                await this.$db.Questions.asyncRemove({ threads_id: trash.threads}, { multi: true })
                await this.$db.Threads.asyncRemove({_id: trash.threads})
                this.$options.parent.writeLog(3, trash.threads, `Đã xóa đề "${row.title}"`)
                this.getData()
            }
        }
    }
}
</script>