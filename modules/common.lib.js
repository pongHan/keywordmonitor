const { sequelize } = require("../models");
const db = require("../models");
const { QueryTypes, BOOLEAN } = require("sequelize");
const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');
const crypto = require('crypto');
const axios = require('axios');

// 대칭키 
const encKey = "1a6b7c2398e6fd46f5347c29e5f942d3";
const encIv = "a5f01b82c9d47e93";


module.exports.countOccurrence = (string, substring) => {
    const regex = new RegExp(substring, 'gi');
    const occurrences = (string.match(regex) || []).length;
    return occurrences;
}

function substringUtf8(str, startByte, length) {
    // 문자열을 Buffer 객체로 변환
    let buffer = Buffer.from(str, 'utf-8');

    // 시작 바이트에서 지정된 길이만큼 Buffer를 잘라냄
    let slicedBuffer = buffer.slice(startByte, startByte + length);

    // 잘라낸 Buffer를 다시 문자열로 변환
    return slicedBuffer.toString('utf-8');
}


module.exports.capitalizeString = (param) => {
    return param.replace(/^(.)(.*)$/, function (_, firstChar, restOfString) {
        return firstChar.toUpperCase() + restOfString;
    });
}

module.exports.camelizeString = (param) => {
    return param.replace(/_([a-z])/g, function (match, letter) {
        return letter.toUpperCase();
    });
}

module.exports.camelizeCapString = (param) => {
    return this.capitalizeString(this.camelizeString(param));
}

module.exports.readPart = (param) => {
    console.log("readPart..");
    var str = "";
    const templateFile = './public/template/parts.js';
    fs.readFile(templateFile, 'utf8', (err, content) => {
        if (err) {
            console.error('Error reading file:', err);
            return;
        }

        var startTag = "<" + param + ">";
        var endTag = "</" + param + ">";
        var startPos = content.indexOf(startTag, 0) + startTag.length;
        var endPos = content.indexOf(endTag, startPos);
        if (startPos > 0 && endPos > startPos) {
            str = content.substring(startPos, endPos);
            console.log(str);
            return str;
        }
    });
    return str;
}



module.exports.isEmptyObj = (param) => {
    return param.constructor === Object && Object.keys(param).length == 0;
}

module.exports.getRowByIdx = async (ptab = "", pid = "") => {
    let query = `SELECT * FROM ${ptab} WHERE id = '${pid}'`;
    console.log(query);
    let row = await sequelize.query(query, { type: QueryTypes.SELECT, raw: true }).catch(err => { console.error(err); });
    row.map(function (elem) {
        for (const [key, value] of Object.entries(elem)) {
            if (typeof (value) == "object" && value !== undefined) {
                elem[key] = value.toString('utf8');
            }
        }
    });
    return row;
}


module.exports.getCodeList = async (p_cd_tp = "") => {
    const list = await db.code.findAll({
        attributes: ["cd_cd", "cd_nm"],
        where: {
            cd_tp: p_cd_tp,
        },
        raw: true
    })
    list.map(function (elem) {
        for (const [key, value] of Object.entries(elem)) {
            if (typeof (value) == "object" && value !== undefined) {
                elem[key] = value.toString('utf8');
            }
        }
    });
    return list;
}


module.exports.getCodeName = async (cd_tp = "", cd_cd = "") => {

    let sql = `SELECT cd_nm FROM tb_code WHERE cd_tp = '${cd_tp}' or cd_cd = '${cd_cd}'`;
    const [data] = await sequelize.query(sql);
    user.map(function (elem) {
        // (key, value) 형식으로 탐색
        for (const [key, value] of Object.entries(elem)) {
            // type 값이 object일 경우는 보통 Buffer이므로 변환
            if (typeof (value) == "object" && value !== undefined) {
                elem[key] = value.toString('utf8');
            }
        }
    });

    return data;
}

module.exports.getMember = async (id = "", email = "") => {

    // 회원정보 가져오기
    let sql = `SELECT * FROM tb_member WHERE mb_id = '${id}' `;
    const [user] = await sequelize.query(sql);
    user.map(function (elem) {
        // (key, value) 형식으로 탐색
        for (const [key, value] of Object.entries(elem)) {
            // type 값이 object일 경우는 보통 Buffer이므로 변환
            if (typeof (value) == "object" && value !== undefined) {
                elem[key] = value.toString('utf8');
            }
        }
    });

    return user;
}

module.exports.getPaging = (page, pageRow, pageScale, totalCount, selfUrl, iParams) => {

    // 4-1. 전체 페이지 계산
    totalPage = Math.ceil(totalCount / pageRow);
    if (totalPage > 1) {

        // 4-2. 페이징을 출력할 변수 초기화
        pagingStr = "";

        pagingStr += "<nav>";
        pagingStr += "<ul class='pagination'>";

        // 4-3. 처음 페이지 링크 만들기
        if (page > 1) {
            pagingStr += `<li class='page-item'><a class='page-link' href='${selfUrl}?iPage=1${iParams}'>처음</a></li>`;
        }

        // 4-4. 페이징에 표시될 시작 페이지 구하기
        startPage = ((Math.ceil(page / pageScale) - 1) * pageScale) + 1;

        // 4-5. 페이징에 표시될 마지막 페이지 구하기
        endPage = startPage + pageScale - 1;
        if (endPage >= totalPage) endPage = totalPage;

        // 4-6. 이전 페이징 영역으로 가는 링크 만들기
        if (startPage > 1) {
            pagingStr += `<li class='page-item'><a class='page-link' href='${selfUrl}?iPage=${(startPage - 1)}${iParams}'>이전</a></li>`;
        }

        // 4-7. 페이지들 출력 부분 링크 만들기
        if (totalPage > 1) {
            for (i = startPage; i <= endPage; i++) {
                // 현재 페이지가 아니면 링크 걸기
                if (page != i) {
                    pagingStr += `<li class='page-item'><a class='page-link' href='${selfUrl}?iPage=${i}${iParams}'><span>${i}</span></a></li>`;
                    // 현재페이지면 굵게 표시하기
                } else {
                    pagingStr += `<li class='page-item active' aria-current='page'><a class='page-link' href='#'>${i}</a></li>`;
                }
            }
        }

        // 4-8. 다음 페이징 영역으로 가는 링크 만들기
        if (totalPage > endPage) {
            pagingStr += `<li class='page-item'><a class='page-link' href='${selfUrl}?iPage=${(endPage + 1)}${iParams}'>다음</a></li>`;
        }

        // 4-9. 마지막 페이지 링크 만들기
        if (page < totalPage) {
            pagingStr += `<li class='page-item'><a class='page-link' href='${selfUrl}?iPage=${totalPage}${iParams}'>맨끝</a></li>`;
        }

        pagingStr += "</ul>";
        pagingStr += "</nav>";

        return pagingStr;

    } else {
        return "";
    }
}

module.exports.getToday = () => {
    const today = new Date();
    const year = today.getFullYear(); const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(today.getDate()).padStart(2, '0');
    const currentDate = `${year}/${month}/${day}`;
    return currentDate;
}

module.exports.getDatetime = () => {
    const now = new Date();
    const formattedDate = `${now.getFullYear()}${pad(now.getMonth() + 1, 2)}${pad(now.getDate(), 2)}${pad(now.getHours(), 2)}${pad(now.getMinutes(), 2)}${pad(now.getSeconds(), 2)}${pad(now.getMilliseconds(), 3)}`;
    return formattedDate;
}

function pad(number, length) {
    const str = String(number);
    return "0".repeat(length - str.length) + str;
}

module.exports.isValidAccess = async (param) => {
    // DB에 등록된 apikey & 유효기간 확인
    // 개발 단계에서는 비활성화 상태로 유지
    /*if (param === undefined) return false;

    let result = false;
    let todayDate = new Date();
    const dbData = await apiKey.findAll();

    dbData.forEach((data) => {
        if (param == data.api_key) {
            if (data.expire_datetime === null) {
                result = true;
            } else if (todayDate < data.expire_datetime) {
                result = true;
            }
        }
    });

    return result;*/
    return true;
}

module.exports.genUUID = (type) => {
    let myuuid = v4();
    return type + myuuid;
}

module.exports.isPkey = (col, datamodelJson) => {
    var flag = false;
    for (var k = 0; k < datamodelJson.length && k < 8; k++) {
        if (datamodelJson[k].hasOwnProperty("keytype") && (datamodelJson[k].keytype.toUpperCase() === 'PRI' || datamodelJson[k].keytype.toUpperCase() === 'PK') && col === datamodelJson[k].column) {
            flag = true;
            break;
        }
    }
    return flag;
}

module.exports.getColType = (col, datamodelJson) => {
    var result = "";
    for (var k = 0; k < datamodelJson.length && k < 8; k++) {
        if (col === datamodelJson[k].column && datamodelJson[k].hasOwnProperty("coltype")) {
            result = datamodelJson[k].coltype;
            break;
        }
    }
    return result;
}

module.exports.isAutoIncrement = (col, datamodelJson) => {
    var flag = false;
    for (var k = 0; k < datamodelJson.length && k < 8; k++) {
        if (datamodelJson[k].hasOwnProperty("auto_increment") && datamodelJson[k].auto_increment === "Y" && col === datamodelJson[k].column) {
            flag = true;
            break;
        }
    }
    return flag;
}

module.exports.getDirectoryPath = (filePath) => {
    const lastIndex = filePath.lastIndexOf('/');
    if (lastIndex !== -1) {
        return filePath.substring(0, lastIndex);
    }
    return filePath;
}

module.exports.isJSON = (value) => {
    try {
        JSON.parse(value);
        return true;
    } catch (error) {
        return false;
    }
}

module.exports.getDatamodelColumn = (dataModelColumns, params) => {
    var json = {};
    for (i = 0; i < dataModelColumns.length; i++) {
        if (dataModelColumns[i].column == params) {
            json = dataModelColumns[i];
            break;
        }
    }
    return json;
}


module.exports.encryptFile = (param) => {

    // 대상 파일의 경로
    const filePath = param;
    const filePath2 = param.replace("template", "encrypt");
    const folderPath = path.dirname(filePath2);
    console.log("filePath=" + filePath + " => " + filePath2);

    // Create the folder recursively
    fs.mkdirSync(folderPath, { recursive: true }, (err) => {
        if (err) {
            console.error('Error creating folder:', err);
            return;
        }
        console.log('Folder created successfully!');
    });

    // 파일 이름을 암호화
    //const encryptedFileName = crypto.createHash('sha256').update(filePath).digest('hex');

    // 파일 내용을 읽기
    const fileContent = fs.readFileSync(filePath);

    // 파일 내용을 암호화
    const cipher = crypto.createCipheriv('aes-256-cbc', encKey, encIv);
    const encryptedContent = Buffer.concat([cipher.update(fileContent), cipher.final()]);

    // 암호화된 파일 이름과 암호화된 파일 내용을 저장
    //fse.writeFileSync(filePath2, encryptedContent);
    fse.writeFile(filePath2, encryptedContent, 'utf8', (err) => {
        if (err) {
            console.error(err);
            return;
        }
    });

    console.log('File encrypted ');
}

module.exports.decryptFile = (param) => {

    // 대상 파일의 경로
    const filePath = param;
    const filePath2 = param.replace("encrypt", "decrypt");
    const folderPath = path.dirname(filePath2);

    // Create the folder recursively
    fs.mkdirSync(folderPath, { recursive: true }, (err) => {
        if (err) {
            console.error('Error creating folder:', err);
            return;
        }
        console.log('Folder created successfully!');
    });

    // 파일 이름을 암호화
    //const encryptedFileName = crypto.createHash('sha256').update(filePath).digest('hex');

    // 암호화된 파일 내용 읽기
    const encryptedContent = fs.readFileSync(filePath);

    // 복호화
    const decipher = crypto.createDecipheriv('aes-256-cbc', encKey, encIv);
    const decryptedContent = Buffer.concat([decipher.update(encryptedContent), decipher.final()]);

    fse.writeFileSync(filePath2, decryptedContent);

    console.log('File decrypted ');
}

module.exports.decryptContent = (filePath) => {

    console.log("decryptContent" + filePath);
    const encryptedContent = fs.readFileSync(filePath);
    // 복호화
    const decipher = crypto.createDecipheriv('aes-256-cbc', encKey, encIv);
    const decryptedContent = Buffer.concat([decipher.update(encryptedContent), decipher.final()]);
    return decryptedContent;
}

module.exports.getAllFilePaths = (folderPath) => {
    let filePaths = [];

    function traverseDirectory(currentPath) {
        const files = fs.readdirSync(currentPath);

        files.forEach((file) => {
            const filePath = path.join(currentPath, file);
            const stat = fs.statSync(filePath);

            if (stat.isDirectory()) {
                traverseDirectory(filePath); // Recursively traverse subdirectories
            } else {
                filePaths.push(filePath); // Add file path to the array
            }
        });
    }

    traverseDirectory(folderPath);
    return filePaths;
}


module.exports.generateCodeSnippets = (input) => {

    const snippets = [];
    const regex = /(\w+)\n```java\n([\s\S]*?)```/g;
    let match;
    while ((match = regex.exec(input)) !== null) {
        const title = `${match[1]}.java`;
        const content = match[2];
        snippets.push({ title, content });
    }
    return snippets;
}

module.exports.generateSelectSQL = (json, targetTable, useColumnComment = true) => {
    
    console.log("generateSelectSQL..");
    const columnInfo = json.columns;
    const tableAliases = new Map();
    const existingAliases = new Set();

    // Helper to generate table aliases
    function generateTableAlias(tableName, existingAliases) {
        let alias = tableName.substring(0, 2).toLowerCase();
        let i = 1;
        while (existingAliases.has(alias)) {
            alias = `${tableName.substring(0, 2).toLowerCase()}${i}`;
            i++;
        }
        existingAliases.add(alias);
        return alias;
    }

    // Assign an alias for the target table
    const targetTableAlias = generateTableAlias(targetTable, existingAliases);
    tableAliases.set(targetTable, targetTableAlias);

    // Generate aliases for all tables and set up selection clause
    let selectClause = [];
    columnInfo.filter(column => column.table_id === targetTable).forEach(column => {
        const columnAlias = useColumnComment ? column.column_comment || column.column : column.column;
        if (column.datatype === 'DT') {  // Check if datatype is Date
            selectClause.push(`\tDATE_FORMAT(${targetTableAlias}.${column.column}, '%Y-%m-%d') AS '${columnAlias}'`);
        } else {
            selectClause.push(`\t${targetTableAlias}.${column.column} AS '${columnAlias}'`);
        }
    });

    // Prepare join clauses
    let joinClauses = '';
    let codeAliasIndex = 1;

    columnInfo.forEach(column => {
        if (column.ref && column.ref.includes('from tb_code')) {
            const refMatch = /where cd_tp = '([^']+)'/.exec(column.ref);
            if (refMatch) {
                const codeType = refMatch[1];
                const codeAlias = `code${codeAliasIndex}`;
                joinClauses += ` \nLEFT JOIN tb_code ${codeAlias} ON ${codeAlias}.cd_cd=${targetTableAlias}.${column.column} AND ${codeAlias}.cd_tp='${codeType}'`;
                selectClause.push(`\t${codeAlias}.cd_nm AS '${column.column}_name'`);
                codeAliasIndex++;
            }
        }
    });

    // Building the full SQL query
    const sqlQuery = `SELECT\n${selectClause.join(',\n')}\nFROM ${targetTable} ${targetTableAlias}${joinClauses}`;
    return sqlQuery;
}
