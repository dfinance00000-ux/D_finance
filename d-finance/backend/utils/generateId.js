const generateMemberId = async (prefix, model) => {
    const lastRecord = await model.findOne().sort({ createdAt: -1 });
    let count = 1;
    if (lastRecord && lastRecord.memberId) {
        const lastId = lastRecord.memberId.split('-')[1];
        count = parseInt(lastId) + 1;
    }
    return `${prefix}-${count.toString().padStart(6, '0')}`;
};

module.exports = { generateMemberId };