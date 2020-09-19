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
                <th>Tạo lúc</th>
                <th>Cập nhật lúc</th>
                <th>Tác vụ</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="(row, index) in table.listing">
                <td>{{ index+1 }}</td>
                <td>{{ row.title }}</td>
                <td>0</td>
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
        getData() {
            var _this = this
            this.$db.Threads.find({}, function (err, docs) {
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