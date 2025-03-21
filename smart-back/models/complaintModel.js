const mongoose =required('mongoose');

const complaintSchema = new mongoose.Schema({
    userId:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
        required:true
    },
    contact:
    {
        type:String,
        required:true
    },
    messages:
    [{
        sender: {type:String, enum:["User","Admin"],required:true},
        text:{type:String,required:true},
        timestamp:{type:Date,default:Date.now},
    }],
    status:{
        type:String,
        enum:["Pending","Resolved"],
        default: "Pending"
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
});

module.exports = mongoose.model("complaint",complaintSchema);
