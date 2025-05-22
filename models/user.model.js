
module.exports = (sequelize, DataTypes) => {
    const user = sequelize.define("tb_user", {
        mb_no: {  //번호
            type: DataTypes.INTEGER(8),
            allowNull: true,
            primaryKey: true,
            autoIncrement:true,
            get() { return this.getDataValue('mb_no'); }
        },
        mb_id: {  //아이디
            type: DataTypes.STRING(50),
            allowNull: false,
            get() { return this.getDataValue('mb_id'); }
        },
        google_id: {  //구글 아이디
            type: DataTypes.STRING(100),
            allowNull: true,
            get() { return this.getDataValue('google_id'); }
        },
        mb_password: {  //비밀번호
            type: DataTypes.STRING(100),
            allowNull: true,
            get() { return this.getDataValue('mb_password'); }
        },
        mb_password2: {  //비밀번호
            type: DataTypes.STRING(100),
            allowNull: true,
            get() { return this.getDataValue('mb_password2'); }
        },
        mb_name: {  //성명
            type: DataTypes.STRING(50),
            allowNull: true,
            get() { return this.getDataValue('mb_name'); }
        },
        org_name: {  //성명
            type: DataTypes.STRING(100),
            allowNull: true,
            get() { return this.getDataValue('org_name'); }
        },
        mb_nick: {  //별명
            type: DataTypes.STRING(50),
            allowNull: true,
            get() { return this.getDataValue('mb_nick'); }
        },
        mb_type: {  //타입
            type: DataTypes.STRING(20),
            allowNull: true,
            get() { return this.getDataValue('mb_type'); }
        },
        mb_level: {  //레벨
            type: DataTypes.STRING(20),
            allowNull: true,
            get() { return this.getDataValue('mb_level'); }
        },
        mb_email: {  //이메일
            type: DataTypes.STRING(100),
            allowNull: true,
            get() { return this.getDataValue('mb_email'); }
        },
        mb_hp: {  //핸드폰
            type: DataTypes.STRING(20),
            allowNull: true,
            get() { return this.getDataValue('mb_hp'); }
        },
        org_id: {  //소속기관
            type: DataTypes.STRING(50),
            allowNull: true,
            get() { return this.getDataValue('org_id'); }
        },
        pjt_id: {  //기본프로젝트
            type: DataTypes.STRING,
            allowNull: true,
            get() { return this.getDataValue('pjt_id'); }
        },
        dept_name: {  //부서
            type: DataTypes.STRING(50),
            allowNull: true,
            get() { return this.getDataValue('dept_name'); }
        },
        verify_token: {  //부서
            type: DataTypes.STRING(100),
            allowNull: true,
            get() { return this.getDataValue('verify_token'); }
        },
        email_verified: {  //부서
            type: DataTypes.STRING(10),
            allowNull: true,
            get() { return this.getDataValue('email_verified'); }
        },
        mb_photo: {  //사진
            type: DataTypes.STRING(200),
            allowNull: true,
            get() { return this.getDataValue('mb_photo'); }
        },
        mb_open_date: {  //가입일자
            type: DataTypes.DATE,
            allowNull: true,
            timestamps: true,
            updatedAt: true,
            get() { return this.getDataValue('mb_open_date'); }
        },
        mb_leave_date: {  //탈퇴일자
            type: DataTypes.STRING(20),
            allowNull: true,
            get() { return this.getDataValue('mb_leave_date'); }
        },
        mb_intercept_date: {  //차단일자
            type: DataTypes.STRING(20),
            allowNull: true,
            get() { return this.getDataValue('mb_intercept_date'); }
        },
    },
        {
            freezeTableName: true,
            timestamps: false
        });
    return user;
}