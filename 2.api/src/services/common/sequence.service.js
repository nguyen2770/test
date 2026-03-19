const { Sequence } = require('../../models');
const { SequenceMeta } = require('../../utils/constant');


const generateSequenceCode = async (sequenceCode) => {
    // Lấy sequence theo code
    let sequence = await Sequence.findOne({ code: sequenceCode });

    if (!sequence) {
        const meta = SequenceMeta[sequenceCode];
        if (!meta) throw new Error('Unknown sequence code');
        sequence = await Sequence.create({
            code: sequenceCode,
            name: meta.name,
            numberIncrement: 1,
            numberNext: 0,
            padding: 5,
            prefix: meta.prefix,
        });
    }
    // Tăng số thứ tự
    const numberNext =
        (sequence.numberNext !== undefined && sequence.numberNext !== null ? sequence.numberNext : 0) +
        (sequence.numberIncrement !== undefined && sequence.numberIncrement !== null ? sequence.numberIncrement : 1);
    // Sinh code
    const code = (sequence.prefix || '') + String(numberNext).padStart(sequence.padding || 7, '0');
    // Cập nhật lại numberNext trong DB
    sequence.numberNext = numberNext;
    await sequence.save();
    return code;
};

module.exports = {
    generateSequenceCode,
};
