const Show = require('../model/show');
const ShowLinkRepository = require('../repository/ShowLinkRepository');
const Qiniu = require('../../utils/qiniu');

let pub = {};

pub.findAll = async () => {
    let res = await Show.findAll();
    return res;
};

pub.findAllFilter = async (filter) => {
    let res = await Show.findAll(filter);
    return res;
};

pub.findAllByYear = async () => {
    let res = await Show.findAll(
        {
            'order': 'year, rank'
        }
    );
    return res;
};

pub.count = async () => {
    return await Show.count();
};

pub.findOne = async (filter) => {
    let res = await Show.findOne({where: filter});
    return res;
};

pub.findShowLinks = async (show, imgId) => {
    return await show.getShowLinks({
        'where': {
            cover_img: imgId
        }
    });
};

pub.create = async (name, desc, year, rank, img) =>{
    let show = await Show.create({name: name, desc: desc, year: year, rank: rank});
    show.setCoverImg(img);
    return show;
};

pub.updateImg = async (show, img) => {
    let oldImg = await show.getCoverImg();
    await Qiniu.deleteFile(oldImg);
    show.setCoverImg(img);
};

pub.updateDesigner = async (show, designerId) => {
    if (designerId) show.designerId = designerId;
    await show.save();
};

pub.update = async (show, name, desc, year) => {
    if (name) show.name = name;
    if (desc) show.desc = desc;
    if (year) show.name = year;
    await show.save();
};

pub.addShowLink = async (show, img) => {
    let showLink = await ShowLinkRepository.create(img);
    showLink.showId = show.get('id');
    await showLink.save();
};

pub.updateRank = async (show, rank) => {
    if (rank) show.rank = rank;
    await show.save();
};

pub.deleteShowLink = async (showLink) =>{
    await ShowLinkRepository.delete(showLink);
};

pub.deleteOne = async (filter) => {
    let show = await pub.findOne(filter);
    pub.delete(show);
};

pub.delete = async (show) => {
    if (show) {
        let img = await show.getCoverImg();
        await Qiniu.deleteFile(img);
        let showLinks = await show.getShowLinks();
        for (let x in showLinks) {
            let showLink = showLinks[x];
            await ShowLinkRepository.delete(showLink);
        }
        await show.destroy();
    }
};

module.exports = pub;