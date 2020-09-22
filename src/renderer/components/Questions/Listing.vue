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
                <td>
                    <router-link :to="{name: 'questions.update', params: {id: row._id}}"><span class="icon icon-pencil"></span></router-link>
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
    watch: {},
    created() {
        this.threads_id = this.$route.params.id
        this.getData()
    },
    methods: {
        getData() {
            var _this = this
            this.$db.Questions.find({threads_id: this.threads_id}, function (err, docs) {
                console.log(docs)
                _this.table.listing = docs
            });
        },
        formatDate(unix_timestamp) {
            return new Date(unix_timestamp).toISOString().slice(0, 19).replace('T', ' ')
        }
    }
}
</script>