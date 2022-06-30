const Studyhub = require('../models/studyhub');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require("../cloudinary");


module.exports.index = async (req, res) => {
    const studyhubs = await Studyhub.find({}).populate('popupText');
    res.render('studyhubs/index', { studyhubs })
}

module.exports.renderNewForm = (req, res) => {
    res.render('studyhubs/new');
}

module.exports.createStudyhub = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.studyhub.location,
        limit: 1
    }).send()
    const studyhub = new Studyhub(req.body.studyhub);
    studyhub.geometry = geoData.body.features[0].geometry;
    studyhub.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    studyhub.author = req.user._id;
    await studyhub.save();
    console.log(studyhub);
    req.flash('success', 'Successfully made a new studyhub!');
    res.redirect(`/studyhubs/${studyhub._id}`)
}

module.exports.showStudyhub = async (req, res,) => {
    const studyhub = await Studyhub.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!studyhub) {
        req.flash('error', 'Cannot find that studyhub!');
        return res.redirect('/studyhubs');
    }
    res.render('studyhubs/show', { studyhub });
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const studyhub = await Studyhub.findById(id)
    if (!studyhub) {
        req.flash('error', 'Cannot find that studyhub!');
        return res.redirect('/studyhubs');
    }
    res.render('studyhubs/edit', { studyhub });
}

module.exports.updateStudyhub = async (req, res) => {
    const { id } = req.params;
    console.log(req.body);
    const studyhub = await Studyhub.findByIdAndUpdate(id, { ...req.body.studyhub });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    studyhub.images.push(...imgs);
    await studyhub.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await studyhub.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully updated studyhub!');
    res.redirect(`/studyhubs/${studyhub._id}`)
}

module.exports.deleteStudyhub = async (req, res) => {
    const { id } = req.params;
    await Studyhub.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted studyhub')
    res.redirect('/studyhubs');
}