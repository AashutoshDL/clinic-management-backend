const mongoose=require('mongoose')


const emailReminderSchema = new mongoose.Schema({
    userId:{
        type:String,
        required: true,
    },
    reminderTime:{
        type:String,
        required:true,
    },
    reminderMessage:{
        type:String,
        default:'This is your daily reminder',
    },
    email:{
        type:String,
        required:true,
    }
})

const EmailReminder = mongoose.model("EmailReminder", emailReminderSchema);

module.exports = EmailReminder;
