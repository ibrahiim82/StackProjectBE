
const AuthSchema = require('../models/auth.js')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')


const register = async(req,res) => {
    try {
        const {username, email, password} = req.body;

        const user = await AuthSchema.findOne({email})

        if (user) {
            return res.status(409).json({msg: "Böyle bir kullanıcı zaten mevcut!"})
        }

        if (password.length < 6) {
            return res.status(401).json({msg: "Şifreniz en az 6 karakter olmalı!"})
        }

        const passwordHash = await bcrypt.hash(password, 12)  // hash=> şifreyi karma işlemidir
        //(password, saltrounds) saltRounds: Şifreleme işleminin kaç turda yapılacağını belirten sayı.
        //Bu sayı ne kadar yüksekse, hash işlemi o kadar uzun sürer (daha güvenli olur).

        if (!isEmail(email)) {
            return res.status(401).json({msg: "Mail hatası!"})
        }

        const newUser = await AuthSchema.create({username, email, password: passwordHash})

        const token = await jwt.sign({id: newUser._id}, "SECRET_KEY", {expiresIn: '1h'}) // 1 saatlik token
        // expiresIn ifadesi, JWT (JSON Web Token) oluşturulurken token’ın ne kadar süre geçerli olacağını belirler.
        // newUser'dan dönen id'ye göre token oluşturulur
        //newUser._id bilgisini token içine yerleştirir (payload).
        //"SECRET_KEY" ile imzalanır.
        //expiresIn: '1h' sayesinde token 1 saat sonra geçersiz olur.

        res.status(201).json({
            status: "OK",
            newUser,
            token
        })

    } catch (error) {
        return res.status(500).json({msg: error.message})
    }
}

const login = async(req,res) => {
    try {
        const {email,password} = req.body
        const user = await AuthSchema.findOne({email})
        if (!user) {
            return res.status(409).json({msg: "Kullanıcı bulunamadı!"})
        }

        const passwordCompare = await bcrypt.compare(password, user.password) // password: Kullanıcının girdiği şifre, user.password: Veritabanındaki hash’lenmiş şifre, compare: İkisini karşılaştırır
        // kullanıcının girdiği şifreyle, veritabanında kayıtlı olan hash’lenmiş şifreyi karşılaştırırız.
        // Şifre doğruysa devam et (örneğin token oluştur)
        if (!passwordCompare) {
            return res.status(409).json({msg: "Hatalı şifre!"})
        }

        const token = await jwt.sign({id: user._id}, "SECRET_KEY", {expiresIn: '1h'}) 

        res.status(200).json({
            status: "OK",
            user,
            token
        })

    } catch (error) {
        return res.status(500).json({msg: error.message})
    }
}

function isEmail(emailAdress){
    let regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(emailAdress);
}

/* function isEmail(emailAdress){
    let regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (emailAdress.match(regex)) 
        return true;

    else 
        return false;
    
} */



module.exports = {register, login}