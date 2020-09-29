<template>
    <div>
        <div class="toolbar-actions clearfix">
                <div class="pull-left" style="width: 80%;">
                    <input @keyup.enter="getData" v-model="table.q" style="width: 23%" type="text" class="form-control" placeholder="Tiêu đề">
                    <select v-model="table.sort.total" style="width: 23%" class="form-control">
                        <option value="0">-- Sắp xếp theo số câu hỏi --</option>
                        <option value="1">Cao đến thấp</option>
                        <option value="2">Thấp đến cao</option>
                    </select>
                    <select v-model="table.sort.point" style="width: 23%" class="form-control">
                        <option value="0">-- Sắp xếp theo điểm --</option>
                        <option value="1">Cao đến thấp</option>
                        <option value="2">Thấp đến cao</option>
                    </select>
                    <select v-model="table.sort.date" style="width: 23%" class="form-control">
                        <option value="0">-- Sắp xếp theo thời gian --</option>
                        <option value="1">Cao đến thấp</option>
                        <option value="2">Thấp đến cao</option>
                    </select>
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
                    <a href="#" @click="exportHtml(index)"><span class="icon icon-download"></span></a>
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
            listing: [],
            sort: {
                date: 0,
                point: 0,
                total: 0
            },
            q: ''
        },
    }),
    created() {
        this.$options.parent.setTitle('Danh sách đề')
        this.getData()
    },
    watch: {
        'table.sort.date': function() {
            this.getData()
        },
        'table.sort.point': function() {
            this.getData()
        },
        'table.sort.total': function() {
            this.getData()
        }
    },
    methods: {
        async getData() {
            const _this = this
            var options = {}
            if(this.table.q !== '') {
                options.title = {
                    $regex: new RegExp(`${this.table.q.trim()}`, 'g')
                }
            }
            var rows = await this.$db.Threads.asyncFind(options)
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
            if(Number(this.table.sort.date) > 0) {
                // Sort date
                rows.sort((a, b)=>{
                    if(Number(_this.table.sort.date) === 2) 
                        return a.created_time - b.created_time
                    else 
                        return b.created_time - a.created_time
                })
            }
            if(Number(this.table.sort.point) > 0) {
                // Sort point
                rows.sort((a, b)=>{
                    if(Number(_this.table.sort.point) === 2) 
                        return a.questions.point - b.questions.point
                    else
                        return b.questions.point - a.questions.point
                })
            }
            if(Number(this.table.sort.total) > 0) {
                // Sort số câu hỏi
                rows.sort((a, b)=>{
                    if(Number(_this.table.sort.total) === 2) 
                        return a.questions.count - b.questions.count
                    else
                        return b.questions.count - a.questions.count
                })
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
        },
        changeToSlug(title)
        {
            var slug;
         
            //Đổi chữ hoa thành chữ thường
            slug = title.toLowerCase();
         
            //Đổi ký tự có dấu thành không dấu
            slug = slug.replace(/á|à|ả|ạ|ã|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/gi, 'a');
            slug = slug.replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/gi, 'e');
            slug = slug.replace(/i|í|ì|ỉ|ĩ|ị/gi, 'i');
            slug = slug.replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/gi, 'o');
            slug = slug.replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/gi, 'u');
            slug = slug.replace(/ý|ỳ|ỷ|ỹ|ỵ/gi, 'y');
            slug = slug.replace(/đ/gi, 'd');
            //Xóa các ký tự đặt biệt
            slug = slug.replace(/\`|\~|\!|\@|\#|\||\$|\%|\^|\&|\*|\(|\)|\+|\=|\,|\.|\/|\?|\>|\<|\'|\"|\:|\;|_/gi, '');
            //Đổi khoảng trắng thành ký tự gạch ngang
            slug = slug.replace(/ /gi, " - ");
            //Đổi nhiều ký tự gạch ngang liên tiếp thành 1 ký tự gạch ngang
            //Phòng trường hợp người nhập vào quá nhiều ký tự trắng
            slug = slug.replace(/\-\-\-\-\-/gi, '-');
            slug = slug.replace(/\-\-\-\-/gi, '-');
            slug = slug.replace(/\-\-\-/gi, '-');
            slug = slug.replace(/\-\-/gi, '-');
            slug = slug.replace(/\s/gi, '');
            //Xóa các ký tự gạch ngang ở đầu và cuối
            slug = '@' + slug + '@';
            slug = slug.replace(/\@\-|\-\@|\@/gi, '');
            return slug;
        },
        async exportHtml(index) {
            if(!confirm("Xác nhận tải xuống đề dưới dạng tệp?")) {
                return;
            }
            var row = this.table.listing[index]
            var questions = await this.$db.Questions.asyncFind({'threads_id': row._id})

            for(let i in questions) {
                for(let i2 in questions[i].questions) {
                    if(i2 !== 'type' && questions[i].questions[i2] !== null) {
                        questions[i].questions[i2] = (await this.$db.Media.asyncFindOne({ _id: questions[i].questions[i2]})).base64
                    }
                }
                for(let i2 in questions[i].answer) {
                    if('image' in questions[i].answer[i2] && questions[i].answer[i2].content === null  && questions[i].answer[i2].image !== null) {
                        questions[i].answer[i2].image = (await this.$db.Media.asyncFindOne({ _id: questions[i].answer[i2].image})).base64
                    }
                }
            }
            var template = require('raw-loader!@/assets/templates/lam-de.txt').default
            template = template.replace('(questions)', JSON.stringify(questions))
            var fileURL = window.URL.createObjectURL(new Blob([template]));
            var fileLink = document.createElement('a');
            fileLink.href = fileURL;
            fileLink.setAttribute('download', this.changeToSlug(row.title)+'.html');
            document.body.appendChild(fileLink);
            fileLink.click();
            this.$options.parent.writeLog(4, row._id, `Đã tải xuống đề "${row.title}"`)
        }
    }
}
</script>