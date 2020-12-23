<template>
    <form class="form" @submit.prevent="update">
        <div class="form-group">
            <label>Thứ tự </label>
            <input v-model="form.stt" type="number" class="form-control" placeholder="Vui lòng nhập" />
            <p class="text-danger help-block" v-if="form.errors.stt">{{ form.errors.stt }}</p>
        </div>
        <div class="form-group">
            <label>Tiêu đề <span class="text-danger">*</span></label>
            <input v-model="form.title" type="text" class="form-control" placeholder="Vui lòng nhập">
            <p class="text-danger help-block" v-if="form.errors.title">{{ form.errors.title }}</p>
        </div>
        <div class="form-group">
            <label>Loại câu hỏi <span class="text-danger">*</span></label>
            <select class="form-control" v-model="form.questions.type">
                <option value="1">Văn bản</option>
                <option value="2">Hình ảnh</option>
                <option value="3">Âm thanh</option>
            </select>
        </div>
        <div class="form-group" v-if="form.switch.questions.media">
            <label>Chọn tệp <span class="text-danger">*</span></label>
            <input type="file" @change="onFileChange" class="form-control" placeholder="Vui lòng nhập">
            <p class="text-danger help-block" v-if="form.errors.questions.image">{{ form.errors.questions.image }}</p>
            <p class="text-danger help-block" v-if="form.errors.questions.audio">{{ form.errors.questions.audio }}</p>
        </div>
        <div class="form-group" v-if="form.switch.questions.media">
            <label>Paste một hình ảnh vào đây <span v-if="form.switch.questions.image" class="text-danger">*</span></label>
            <input @paste="onPaste" type="text" class="form-control" placeholder="Vui lòng nhập">
            <p class="text-danger help-block" v-if="form.errors.questions.image">{{ form.errors.questions.image }}</p>
        </div>
        <div class="form-group" v-if="form.switch.questions.text">
            <label>Nội dung <span class="text-danger">*</span></label>
            <textarea v-model="form.questions.text" placeholder="Vui lòng nhập" class="form-control" rows="3"></textarea>
            <p class="text-danger help-block" v-if="form.errors.questions.text">{{ form.errors.questions.text }}</p>
        </div>
        <div class="form-group media">
            <audio v-if="form.questions.audio" controls>
              <source :src="form.questions.audio">
            </audio>
            <hr v-if="form.questions.audio && form.questions.image" />
            <img v-if="form.questions.image" :src="form.questions.image">
            <p class="text-center remove"><span @click="removeValueQuestions" class="text-danger">--- Xóa nội dung ---</span></p>
        </div>
        <div class="form-group">
            <label>Thời gian </label>
            <input v-model="form.minute" type="number" class="form-control" placeholder="Thời gian tính bằng giây. Vd: 10">
        </div>
        <div class="form-group">
            <label>Điểm </label>
            <input v-model="form.point" type="number" class="form-control" placeholder="Vui lòng nhập">
        </div>
        <div class="form-group">
            <label>Ghi chú </label>
            <textarea v-model="form.note" placeholder="Vui lòng nhập" class="form-control" rows="2"></textarea>
        </div>
        <div class="form-group answer">
            <label>Đáp án <span class="text-danger">*</span></label>
            <div class="clearfix" v-for="(row, index) in form.answer">
                <span class="pull-left stt">{{ row.stt }}</span>
                <div class="answer-group pull-right">
                    <label class="container-checkbox">
                        <input type="checkbox" :checked="row.active" @click="row.active = !row.active">
                        <span class="checkmark"></span>
                    </label>
                    <input v-model="row.content" @change="row.image = null" @paste="(evt)=> {getFileBase(evt.clipboardData.files, index) }" type="text" class="form-control" placeholder="Vui lòng nhập">
                    <span @click="form.answer.splice(index, 1)" class="icon icon-trash text-danger"></span>
                    <img v-if="row.image" :src="row.image">
                    <p class="text-danger help-block" v-if="form.errors.answer[row.key]">{{ form.errors.answer[row.key] }}</p>
                </div>
            </div>
            <p class="text-danger help-block" v-if="form.errors.answer.index">{{ form.errors.answer.index }}</p>
            <p class="text-center add"><span @click="addAnswer">--- Thêm đáp án ---</span></p>
        </div>
        <div class="form-actions">
            <router-link :to="{name: 'questions.listing', params: {id: threads_id}}" class="btn btn-form btn-default btn-large">Hủy bỏ</router-link>
            <span @click="update" type="submit" class="btn btn-form btn-primary btn-large">Cập nhật</span>
        </div>
    </form>
</template>

<script>
export default {
    data: () => ({
        questions_id: null,
        threads_id: null,
        questions_now: null,
        form: {
            stt: 0,
            title: null,
            minute: null,
            point: null,
            note: null,
            questions: {
                type: 1,
                audio: null,
                text: null,
                image: null,
            },
            answer: [],
            switch: {
                questions: {
                    audio: false,
                    image: false,
                    media: false,
                    text: true,
                }
            },
            errors: {},
            answer_stt: ['A','B','C','D','E','F','G','H','I','K','L','M','N','O','P','Q','R']
        },
    }),
    watch: {
        'form.questions.type': function(_new) {
            this.form.switch.questions.media = false
            this.form.switch.questions.audio = false
            this.form.switch.questions.image = false
            this.form.switch.questions.text  = false
            this.removeValueQuestions()
            switch(Number(_new)) {
                case 1:
                    this.form.switch.questions.text = true
                break
                case 2:
                    this.form.switch.questions.image = true
                break
                case 3:
                    this.form.switch.questions.audio = true
            }
            this.form.switch.questions.media = this.form.switch.questions.image || this.form.switch.questions.audio
        },
        'form.answer': function() {
            for(let i = 0;i < this.form.answer.length;i++) {
                this.form.answer[i].stt = i in this.form.answer_stt ? this.form.answer_stt[i] : 'NaN'
            }
        },
    },
    created() {
        this.$options.parent.setTitle('Cập nhật câu hỏi')
        this.questions_id = this.$route.params.id
        this.threads_id = this.$route.params.id
        this.getData()
        this.resetFormErrors()
    },
    methods: {
        async getData() {
            this.questions_now= await this.$db.Questions.asyncFindOne({ _id: this.questions_id })
            this.threads_id = this.questions_now.threads_id
            this.form.questions.type = this.questions_now.questions.type
            this.form.minute = this.questions_now.minute
            this.form.title = this.questions_now.title
            this.form.note = this.questions_now.note
            this.form.point = this.questions_now.point
            this.form.stt = 'stt' in this.questions_now ? this.questions_now.stt : 1

            // Udate key image
            for(let index in this.questions_now.questions) {
                if(index !== 'type' && this.questions_now.questions[index] !== null) {
                    try{
                        let row = await this.$db.Media.asyncFindOne({ _id: this.questions_now.questions[index]})
                        this.form.questions[index] = this.$options.parent.readFile(row.base64)
                    } catch (e) {
                        alert('Câu hỏi bị lỗi ảnh/âm thanh vui lòng nhập lại!')
                        console.log(this.questions_now.questions[index])
                    }
                }
            }
            for(let index in this.questions_now.answer) {
                let temp = Object.assign({}, this.questions_now.answer[index])
                    if('image' in temp && temp.content === null  && temp.image !== null) {
                        try{
                            let row = await this.$db.Media.asyncFindOne({ _id: temp.image})
                            temp.image = this.$options.parent.readFile(row.base64)
                        } catch (e) {console.log(temp.image)}
                    }
                this.form.answer.push(temp)
            }

        },
        onPaste (evt) {
            this.getFileBase(evt.clipboardData.files)
        },
        onFileChange(e) {
            var files = e.target.files || e.dataTransfer.files
            this.getFileBase(files)
        },
        getFileBase(files, answer_index=null) {
            if (!files.length)
                return;

            // Lấy ra base 64 của image đầu 
            var image = new Image()
            var reader = new FileReader()
            var vm = this;
            reader.onload = (e) => {
                if(answer_index !== null) {
                    vm.form.answer[answer_index].image = e.target.result
                    vm.form.answer[answer_index].content = null
                } else {
                    switch(Number(vm.form.questions.type)){
                        case 2:
                            vm.form.questions.image = e.target.result
                        break
                        case 3:
                            var isBase64 = require('is-base64')
                            if(isBase64(e.target.result, { allowMime: true })) {
                                vm.form.questions.image = e.target.result
                            } else {
                                vm.form.questions.audio = e.target.result
                            }
                    }
                }
            }
            reader.readAsDataURL(files[0])
        },
        resetFormErrors() {
            this.form.errors = {
                stt: null,
                title: null,
                minute: null,
                point: null,
                note: null,
                questions: {
                    audio: null,
                    text: null,
                    image: null,
                },
                answer: {
                    index: null
                }
            }
            for(let i in this.form.answer) 
                this.form.errors.answer[this.form.answer[i].key] = null
        },
        addAnswer() {
            var uid = null
            do {
                uid = Math.floor(Math.random() * 100)
                for(let i in this.form.answer) {
                    if(this.form.answer[i].key == uid) uid = null
                }
            } while(uid == null)
            this.form.answer.push({
                active: false,
                content: null,
                image: null,
                stt: 'NaN',
                key: uid
            })
            this.form.errors.answer[uid] = null
        },
        removeValueQuestions() {
            this.form.questions.image = null
            this.form.questions.text = null
            this.form.questions.audio = null
        },
        valiadted() {
            this.resetFormErrors()
            let pass = true;
            if(this.form.title == null) {
                pass = false
                this.form.errors.title = 'Vui lòng nhập thông tin'
            }

            if(this.form.questions.type == 2 && this.form.questions.image == null) {
                pass = false
                this.form.errors.questions.image = 'Vui lòng chọn một ảnh'
            } else if(this.form.questions.type == 3 && this.form.questions.audio == null) {
                pass = false
                this.form.errors.questions.audio = 'Vui lòng chọn một tệp âm thanh'
            } else if(this.form.questions.type == 4 && this.form.questions.image == null) {
                pass = false
                this.form.errors.questions.image = 'Vui lòng paste một ảnh'
            } else if(this.form.questions.text == null && this.form.questions.type == 1){
                pass = false 
                this.form.errors.questions.text = 'Vui lòng nhập nội dung'
            }

            if(!this.form.answer.length) {
                this.form.errors.answer.index = 'Vui lòng thêm ít nhất 1 đáp án'
                return false
            }

            if(Number(this.form.stt) <= 0) {
                this.form.errors.stt = 'Số thứ tự phải lớn hơn 0'
                return false
            }

            let answer_active = false
            for(let i in this.form.answer) {
                let item = this.form.answer[i]
                if(!answer_active && item.active) answer_active = true
                if(item.content === null && item.image === null) {
                    pass = false
                    this.form.errors.answer[item.key] = 'Vui lòng nhập nội dung hoặc paste một ảnh'
                }
            }

            if(!answer_active) {
                pass = false
                this.form.errors.answer.index = 'Vui lòng chọn ít nhất 1 đáp án đúng'
            }
            return pass
        },
        async update() {
            if(this.valiadted()) {
                const os = require('os')
                let timestamp = Date.now();
                var data_update = {
                    threads_id: this.questions_now.threads_id,
                    title: this.form.title,
                    stt: this.form.stt,
                    minute: this.form.minute,
                    point: this.form.point,
                    note: this.form.note,
                    questions: {
                        type: this.form.questions.type,
                    },
                    answer: this.form.answer,
                    created_at: this.questions_now.created_at,
                    updated_at: os.userInfo().username,
                    created_time: this.questions_now.created_time,
                    updated_time: timestamp,
                }
                // Insert media 
                for(let index in this.form.questions) {
                    if(index !== 'type' && this.form.questions[index] !== null) {
                        let row = await this.$db.Media.asyncInsert({
                            base64: this.$options.parent.saveFile(this.form.questions[index])
                        })
                        data_update.questions[index] = row._id
                    }
                }
                for(let index in data_update.answer) {
                    if(data_update.answer[index].content == null) {
                        let row = await this.$db.Media.asyncInsert({
                            base64: this.$options.parent.saveFile(data_update.answer[index].image)
                        })
                        data_update.answer[index].image = row._id
                    }
                }
                let row = this.$db.Questions.asyncUpdate({'_id': this.questions_id}, data_update)
                .then(doc => {
                    this.$options.parent.writeLog(2, this.questions_id, `Đã cập nhật câu hỏi "${data_update.title}"`)
                    if(confirm('Cập nhật thành công, bạn có muốn tiếp tục cập nhật câu hỏi?')) {
                        window.location.reload()
                    } else {
                        this.$router.push({ name: "questions.listing", params: {id: this.threads_id}})
                    }
                })
            }

        }
    }
}
</script>