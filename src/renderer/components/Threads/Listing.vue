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
                <td>
                    <router-link :to="{name: 'questions.listing', params: {id: row._id}}"><span class="icon icon-folder"></span></router-link>
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
    watch: {},
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

    }
}
</script>