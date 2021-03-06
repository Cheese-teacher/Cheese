//response
//external modules
var ejs = require('ejs');
var fs = require('fs');
var path = require('path');
var markdownpdf = require("markdown-pdf");
var LZString = require('lz-string');
var S = require('string');
var shortId = require('shortid');
var metaMarked = require('meta-marked');
var querystring = require('querystring');
var request = require('request');
var moment = require('moment');

//core
var config = require("./config.js");
var logger = require("./logger.js");
var models = require("./models");

//slides
var md = require('reveal.js/plugin/markdown/markdown');

//mysql setting
var mysql = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'admin',
  password : 'admin',
  database : 'hackmd'
});

//reveal.js
var slideOptions = {
    separator: '^(\r\n?|\n)---(\r\n?|\n)$',
    verticalSeparator: '^(\r\n?|\n)----(\r\n?|\n)$'
};

//public
var response = {
    errorForbidden: function (res) {
        responseError(res, "403", "Forbidden", "oh no.");
    },
    errorNotFound: function (res) {
        responseError(res, "404", "Not Found", "oops.");
    },
    errorInternalError: function (res) {
        responseError(res, "500", "Internal Error", "wtf.");
    },
    errorServiceUnavailable: function (res) {
        res.status(503).send("I'm busy right now, try again later.");
    },
    newNote: newNote,
    showNote: showNote,
    showPublishNote: showPublishNote,
    showPublishSlide: showPublishSlide,
    showIndex: showIndex,
    noteActions: noteActions,
    publishNoteActions: publishNoteActions,
    githubActions: githubActions,
    gitlabActions: gitlabActions,
    newNoteWithClass : newNoteWithClass
};

function responseError(res, code, detail, msg) {
    res.writeHead(code, {
        'Content-Type': 'text/html'
    });
    var template = config.errorpath;
    var options = {
        cache: !config.debug,
        filename: template
    };
    var compiled = ejs.compile(fs.readFileSync(template, 'utf8'), options);
    var content = compiled({
        url: config.serverurl,
        title: code + ' ' + detail + ' ' + msg,
        cache: !config.debug,
        filename: template,
        code: code,
        detail: detail,
        msg: msg,
        useCDN: config.usecdn
    });
    res.write(content);
    res.end();
}

function showIndex(req, res, next) {
    res.writeHead(200, {
        'Content-Type': 'text/html'
    });
    var template = config.indexpath;
    var options = {
        cache: !config.debug,
        filename: template
    };
    var compiled = ejs.compile(fs.readFileSync(template, 'utf8'), options);
    var content = compiled({
        url: config.serverurl,
        useCDN: config.usecdn,
        facebook: config.facebook,
        twitter: config.twitter,
        github: config.github,
        gitlab: config.gitlab,
        dropbox: config.dropbox,
        google: config.google
    });
    res.write(content);
    res.end();
}

function responseHackMD(res, note) {
    var body = LZString.decompressFromBase64(note.content);
    var meta = null;
    try {
        meta = models.Note.parseMeta(metaMarked(body).meta);
    } catch(err) {
        //na
    }
    var title = models.Note.decodeTitle(note.title);
    title = models.Note.generateWebTitle(meta.title || title);
    var template = config.hackmdpath;
    var options = {
        cache: !config.debug,
        filename: template
    };
    var compiled = ejs.compile(fs.readFileSync(template, 'utf8'), options);
    var html = compiled({
        url: config.serverurl,
        title: title,
        useCDN: config.usecdn,
        facebook: config.facebook,
        twitter: config.twitter,
        github: config.github,
        gitlab: config.gitlab,
        dropbox: config.dropbox,
        google: config.google
    });
    var buf = html;
    res.writeHead(200, {
        'Content-Type': 'text/html; charset=UTF-8',
        'Cache-Control': 'private',
        'Content-Length': buf.length,
        'X-Robots-Tag': 'noindex, nofollow' // prevent crawling
    });
    res.end(buf);
}

function newNote(req, res, next) {
    var owner = null;
    if (req.isAuthenticated()) {
        owner = req.user.id;
    }
    models.Note.create({
        ownerId: owner
    }).then(function (note) {
        return res.redirect(config.serverurl + "/" + LZString.compressToBase64(note.id));
    }).catch(function (err) {
        logger.error(err);
        return response.errorInternalError(res);
    });
}

function newNoteWithClass(req, res, next) {
    var Class = req.session.courseid;
    //update hackmd.notes set `title` = (select Class from class where Class='1051,000001,0'),`content` = (select Class from class where Class='1051,000001,0')where shortid = 'H1Kl6ErQl'
    var owner = null;
    if (req.isAuthenticated()) {
        owner = req.user.id;
    }
    models.Note.create({
        ownerId: owner
    }).then(function (note) {
        //根據note.id來查詢對應的筆記，並把class加進去
        var selectSql = 'select Classname from Class where Class = "' + Class + '"';
        connection.query(selectSql ,function(err,result){
            if(err) {
                logger.error(err);
            } else {
                var Classname = result[0].Classname;
                var contentCompressToBase64 = LZString.compressToBase64("# " + Classname);
                var titleCompressToBase64 = LZString.compressToBase64(Classname);
                var sql = 'update Notes set class = "' + Class +'", title = "' + titleCompressToBase64 + '", content = "' + contentCompressToBase64 + '"  where id = "' + note.id + '" ';
                connection.query(sql ,function(err,result){
            		if(err) {
                        logger.error(err);
            		} else {
                        return res.redirect(config.serverurl + "/" + LZString.compressToBase64(note.id));
            		}
                });
            }
        });

    }).catch(function (err) {
        logger.error(err);
        return response.errorInternalError(res);
    });

}

function checkViewPermission(req, note) {
    if (note.permission == 'private') {
        if (!req.isAuthenticated() || note.ownerId != req.user.id)
            return false;
        else
            return true;
    } else {
        return true;
    }
}

function findNote(req, res, callback, include) {
    var id = req.params.noteId || req.params.shortid;
    models.Note.parseNoteId(id, function (err, _id) {
        models.Note.findOne({
            where: {
                id: _id
            },
            include: include || null
        }).then(function (note) {
            if (!note) {
                return response.errorNotFound(res);
            }
            if (!checkViewPermission(req, note)) {
                return response.errorForbidden(res);
            } else {
                return callback(note);
            }
        }).catch(function (err) {
            logger.error(err);
            return response.errorInternalError(res);
        });
    });
}

function showNote(req, res, next) {
    findNote(req, res, function (note) {
        // force to use note id
        var noteId = req.params.noteId;
        var id = LZString.compressToBase64(note.id);
        if ((note.alias && noteId != note.alias) || (!note.alias && noteId != id))
            return res.redirect(config.serverurl + "/" + (note.alias || id));
        return responseHackMD(res, note);
    });
}

function showPublishNote(req, res, next) {
    var include = [{
        model: models.User,
        as: "owner"
    }, {
        model: models.User,
        as: "lastchangeuser"
    }];
    findNote(req, res, function (note) {
        // force to use short id
        var shortid = req.params.shortid;
        if ((note.alias && shortid != note.alias) || (!note.alias && shortid != note.shortid))
            return res.redirect(config.serverurl + "/s/" + (note.alias || note.shortid));
        note.increment('viewcount').then(function (note) {
            if (!note) {
                return response.errorNotFound(res);
            }
            var body = LZString.decompressFromBase64(note.content);
            var meta = null;
            try {
                meta = models.Note.parseMeta(metaMarked(body).meta);
            } catch(err) {
                //na
            }
            var createtime = note.createdAt;
            var updatetime = note.lastchangeAt;
            var text = S(body).escapeHTML().s;
            var title = models.Note.decodeTitle(note.title);
            title = models.Note.generateWebTitle(meta.title || title);
            var origin = config.serverurl;
            var data = {
                title: title,
                description: meta.description,
                viewcount: note.viewcount,
                createtime: createtime,
                updatetime: updatetime,
                url: origin,
                body: text,
                useCDN: config.usecdn,
                lastchangeuserprofile: note.lastchangeuser ? models.User.parseProfile(note.lastchangeuser.profile) : null,
                robots: meta.robots || false, //default allow robots
                GA: meta.GA
            };
            return renderPublish(data, res);
        }).catch(function (err) {
            logger.error(err);
            return response.errorInternalError(res);
        });
    }, include);
}

function renderPublish(data, res) {
    var template = config.prettypath;
    var options = {
        cache: !config.debug,
        filename: template
    };
    var compiled = ejs.compile(fs.readFileSync(template, 'utf8'), options);
    var html = compiled(data);
    var buf = html;
    res.writeHead(200, {
        'Content-Type': 'text/html; charset=UTF-8',
        'Cache-Control': 'private',
        'Content-Length': buf.length
    });
    res.end(buf);
}

function actionPublish(req, res, note) {
    res.redirect(config.serverurl + "/s/" + (note.alias || note.shortid));
}

function actionSlide(req, res, note) {
    res.redirect(config.serverurl + "/p/" + (note.alias || note.shortid));
}

function actionDownload(req, res, note) {
    var body = LZString.decompressFromBase64(note.content);
    var title = models.Note.decodeTitle(note.title);
    var filename = title;
    filename = encodeURIComponent(filename);
    res.writeHead(200, {
        'Access-Control-Allow-Origin': '*', //allow CORS as API
        'Access-Control-Allow-Headers': 'Range',
        'Access-Control-Expose-Headers': 'Cache-Control, Content-Encoding, Content-Range',
        'Content-Type': 'text/markdown; charset=UTF-8',
        'Cache-Control': 'private',
        'Content-disposition': 'attachment; filename=' + filename + '.md',
        'Content-Length': body.length,
        'X-Robots-Tag': 'noindex, nofollow' // prevent crawling
    });
    res.end(body);
}

function actionPDF(req, res, note) {
    var body = LZString.decompressFromBase64(note.content);
    try {
        body = metaMarked(body).markdown;
    } catch(err) {
        //na
    }
    var title = models.Note.decodeTitle(note.title);

    if (!fs.existsSync(config.tmppath)) {
        fs.mkdirSync(config.tmppath);
    }
    var path = config.tmppath + '/' + Date.now() + '.pdf';
    markdownpdf().from.string(body).to(path, function () {
        var stream = fs.createReadStream(path);
        var filename = title;
        // Be careful of special characters
        filename = encodeURIComponent(filename);
        // Ideally this should strip them
        res.setHeader('Content-disposition', 'attachment; filename="' + filename + '.pdf"');
        res.setHeader('Cache-Control', 'private');
        res.setHeader('Content-Type', 'application/pdf; charset=UTF-8');
        res.setHeader('X-Robots-Tag', 'noindex, nofollow'); // prevent crawling
        stream.pipe(res);
        fs.unlink(path);
    });
}

function actionGist(req, res, note) {
    var data = {
        client_id: config.github.clientID,
        redirect_uri: config.serverurl + '/auth/github/callback/' + LZString.compressToBase64(note.id) + '/gist',
        scope: "gist",
        state: shortId.generate()
    };
    var query = querystring.stringify(data);
    res.redirect("https://github.com/login/oauth/authorize?" + query);
}

function actionRevision(req, res, note) {
    var actionId = req.params.actionId;
    if (actionId) {
        var time = moment(parseInt(actionId));
        if (time.isValid()) {
            models.Revision.getPatchedNoteRevisionByTime(note, time, function (err, content) {
                if (err) {
                    logger.error(err);
                    return response.errorInternalError(res);
                }
                if (!content) {
                    return response.errorNotFound(res);
                }
                res.end(JSON.stringify(content));
            });
        } else {
            return response.errorNotFound(res);
        }
    } else {
        models.Revision.getNoteRevisions(note, function (err, data) {
            if (err) {
                logger.error(err);
                return response.errorInternalError(res);
            }
            var out = {
                revision: data
            };
            res.end(JSON.stringify(out));
        });
    }
}

function noteActions(req, res, next) {
    var noteId = req.params.noteId;
    findNote(req, res, function (note) {
        var action = req.params.action;
        switch (action) {
        case "publish":
        case "pretty": //pretty deprecated
            actionPublish(req, res, note);
            break;
        case "slide":
            actionSlide(req, res, note);
            break;
        case "download":
            actionDownload(req, res, note);
            break;
        case "pdf":
            actionPDF(req, res, note);
            break;
        case "gist":
            actionGist(req, res, note);
            break;
        case "revision":
            actionRevision(req, res, note);
            break;
        default:
            return res.redirect(config.serverurl + '/' + noteId);
            break;
        }
    });
}

function publishNoteActions(req, res, next) {
    findNote(req, res, function (note) {
        var action = req.params.action;
        switch (action) {
        case "edit":
            res.redirect(config.serverurl + '/' + (note.alias ? note.alias : LZString.compressToBase64(note.id)));
            break;
        default:
            res.redirect(config.serverurl + '/s/' + note.shortid);
            break;
        }
    });
}

function githubActions(req, res, next) {
    var noteId = req.params.noteId;
    findNote(req, res, function (note) {
        var action = req.params.action;
        switch (action) {
        case "gist":
            githubActionGist(req, res, note);
            break;
        default:
            res.redirect(config.serverurl + '/' + noteId);
            break;
        }
    });
}

function githubActionGist(req, res, note) {
    var code = req.query.code;
    var state = req.query.state;
    if (!code || !state) {
        return response.errorForbidden(res);
    } else {
        var data = {
            client_id: config.github.clientID,
            client_secret: config.github.clientSecret,
            code: code,
            state: state
        }
        var auth_url = 'https://github.com/login/oauth/access_token';
        request({
                url: auth_url,
                method: "POST",
                json: data
            }, function (error, httpResponse, body) {
            if (!error && httpResponse.statusCode == 200) {
                var access_token = body.access_token;
                if (access_token) {
                    var content = LZString.decompressFromBase64(note.content);
                    var title = models.Note.decodeTitle(note.title);
                    var filename = title.replace('/', ' ') + '.md';
                    var gist = {
                        "files": {}
                    };
                    gist.files[filename] = {
                        "content": content
                    };
                    var gist_url = "https://api.github.com/gists";
                    request({
                        url: gist_url,
                        headers: {
                            'User-Agent': 'HackMD',
                            'Authorization': 'token ' + access_token
                        },
                        method: "POST",
                        json: gist
                    }, function (error, httpResponse, body) {
                        if (!error && httpResponse.statusCode == 201) {
                            res.setHeader('referer', '');
                            res.redirect(body.html_url);
                        } else {
                            return response.errorForbidden(res);
                        }
                    });
                } else {
                    return response.errorForbidden(res);
                }
            } else {
                return response.errorForbidden(res);
            }
        })
    }
}

function gitlabActions(req, res, next) {
    var noteId = req.params.noteId;
    findNote(req, res, function (note) {
        var action = req.params.action;
        switch (action) {
        case "projects":
            gitlabActionProjects(req, res, note);
            break;
        default:
            res.redirect(config.serverurl + '/' + noteId);
            break;
        }
    });
}

function gitlabActionProjects(req, res, note) {
    if (req.isAuthenticated()) {
        models.User.findOne({
            where: {
                id: req.user.id
            }
        }).then(function (user) {
            if (!user)
                return response.errorNotFound(res);
            var ret = { baseURL: config.gitlab.baseURL };
            ret.accesstoken = user.accessToken;
            ret.profileid = user.profileid;
            request(
                config.gitlab.baseURL + '/api/v3/projects?access_token=' + user.accessToken,
                function(error, httpResponse, body) {
                    if (!error && httpResponse.statusCode == 200) {
                        ret.projects = JSON.parse(body);
                        return res.send(ret);
                    } else {
                        return res.send(ret);
                    }
                }
            );
        }).catch(function (err) {
            logger.error('gitlab action projects failed: ' + err);
            return response.errorInternalError(res);
        });
    } else {
        return response.errorForbidden(res);
    }
}

function showPublishSlide(req, res, next) {
    findNote(req, res, function (note) {
        // force to use short id
        var shortid = req.params.shortid;
        if ((note.alias && shortid != note.alias) || (!note.alias && shortid != note.shortid))
            return res.redirect(config.serverurl + "/p/" + (note.alias || note.shortid));
        note.increment('viewcount').then(function (note) {
            if (!note) {
                return response.errorNotFound(res);
            }
            var body = LZString.decompressFromBase64(note.content);
            var meta = null;
            try {
                var obj = metaMarked(body);
                body = obj.markdown;
                meta = models.Note.parseMeta(obj.meta);
            } catch(err) {
                //na
            }
            var text = S(body).escapeHTML().s;
            var title = models.Note.decodeTitle(note.title);
            title = models.Note.generateWebTitle(meta.title || title);
            var slides = md.slidify(text, slideOptions);
            var origin = config.serverurl;
            var data = {
                url: origin,
                title: title,
                description: meta.description,
                slides: slides,
                slideOptions: JSON.stringify(meta.slideOptions || {}),
                GA: meta.GA,
                useCDN: config.usecdn
            };
            return renderPublishSlide(data, res);
        }).catch(function (err) {
            logger.error(err);
            return response.errorInternalError(res);
        });
    });
}

function renderPublishSlide(data, res) {
    var template = config.slidepath;
    var options = {
        cache: !config.debug,
        filename: template
    };
    var compiled = ejs.compile(fs.readFileSync(template, 'utf8'), options);
    var html = compiled(data);
    var buf = html;
    res.writeHead(200, {
        'Content-Type': 'text/html; charset=UTF-8',
        'Cache-Control': 'private',
        'Content-Length': buf.length
    });
    res.end(buf);
}

module.exports = response;
