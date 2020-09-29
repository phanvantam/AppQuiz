<template>
    <form class="form" @submit.prevent="create">
        <div class="form-group">
            <label>Tiêu đề <span class="text-danger">*</span></label>
            <input v-model="form.title" type="text" class="form-control" placeholder="Vui lòng nhập">
            <p class="text-danger help-block" v-if="form.errors.title">{{ form.errors.title }}</p>
        </div>
        <div class="form-group">
            <label>Mô tả</label>
            <select class="form-control" v-model="form.description.type">
                <option value="0">-- Không có --</option>
                <option value="1">Hình ảnh</option>
                <option value="2">Video</option>
            </select>
            <p class="text-danger help-block" v-if="form.errors.description.type">{{ form.errors.description.type }}</p>
        </div>
        <div class="form-group" v-if="form.switch.description.video">
            <label>Định danh video trên youtube <span class="text-danger">*</span></label>
            <input v-model="form.description.video" type="text" class="form-control" placeholder="Vui lòng nhập">
            <p class="text-danger help-block" v-if="form.errors.description.video">{{ form.errors.description.video }}</p>
        </div>
        <div class="form-group" v-if="form.switch.description.image">
            <label>Chọn hình ảnh <span class="text-danger">*</span></label>
            <input type="file" @change="onFileChange" class="form-control" placeholder="Vui lòng nhập">
            <p class="text-danger help-block" v-if="form.errors.description.image">{{ form.errors.description.image }}</p>
        </div>
        <div v-if="form.description.type != 0" class="form-group media">
            <img v-if="form.description.image" :src="form.description.image">
            <iframe v-if="form.description.video" :src="'https://www.youtube.com/embed/'+form.description.video" ></iframe>
            <p class="text-center remove"><span @click="removeValueDescription" class="text-danger">--- Xóa nội dung ---</span></p>
        </div>
        <div class="form-actions">
            <router-link :to="{name: 'threads.listing'}" class="btn btn-form btn-default btn-large">Hủy bỏ</router-link>
            <span @click="create" type="submit" class="btn btn-form btn-primary btn-large">Khởi tạo</span>
        </div>
    </form>
</template>

<script>
export default {
    data: () => ({
        form: {
            title: null,
            description: {
                type: 0,
                video: null,
                image: null
            },
            switch: {
                description: {
                    image: false,
                    video: false,
                }
            },
            errors: {}
        },
    }),
    watch: {
        'form.description.type': function(_new) {
            this.removeValueDescription()
            this.form.switch.description.video = false
            this.form.switch.description.image = false
            switch(Number(_new)) {
                case 1:
                    this.form.switch.description.image = true
                break
                case 2:
                    this.form.switch.description.video = true
            }
        }
    },
    created() {
        this.$options.parent.setTitle('Tạo mới đề')
        this.resetFormErrors()
    },
    methods: {
        removeValueDescription() {
            this.form.description.image = null
            this.form.description.video = null
        },
        onFileChange(e) {
            var files = e.target.files || e.dataTransfer.files
            if (!files.length)
                return;

            // Lấy ra base 64 của image đầu 
            var image = new Image()
            var reader = new FileReader()
            var vm = this;

            reader.onload = (e) => {
                vm.form.description.image = e.target.result
            }
            reader.readAsDataURL(files[0])
        },
        resetFormErrors() {
            this.form.errors = {
                title: null,
                description: {
                    type: null,
                    video: null,
                    image: null
                }
            }
        },
        valiadted() {
            this.resetFormErrors()
            let pass = true;
            if(this.form.title == null) {
                pass = false
                this.form.errors.title = 'Vui lòng nhập thông tin'
            }

            if(this.form.description.type == 1 && this.form.description.image == null) {
                pass = false
                this.form.errors.description.image = 'Vui lòng chọn một ảnh'
            } else if(this.form.description.type == 2 && this.form.description.video == null) {
                pass = false
                this.form.errors.description.video = 'Vui lòng nhập định danh video'
            }
            return pass
        },
        async create() {

            if(this.valiadted()) {
                const os = require('os')
                let timestamp = Date.now();
                var data_insert = {
                    title: this.form.title,
                    description: {
                        type: this.form.description.type
                    },
                    created_at: os.userInfo().username,
                    updated_at: os.userInfo().username,
                    created_time: timestamp,
                    updated_time: timestamp,
                }
                if(this.form.description.type == 1) {
                    data_insert.description.image = (await this.$db.Media.asyncInsert({
                            base64: this.form.description.image
                        }))._id
                } else {
                    data_insert.description.video = this.form.description.video
                }
                this.$db.Threads.asyncInsert(data_insert).then(doc => {
                    this.$options.parent.writeLog(1, doc._id, `Đã thêm đề "${doc.title}"`)
                    if(confirm('Tạo đề thành công, bạn có muốn thêm câu hỏi luôn?')) {
                        this.$router.push({ name: "questions.create", params: {id: doc._id}})
                    } else {
                        this.$router.push({ name: "threads.listing"})
                    }
                })
            }
        }
    }
}
</script>