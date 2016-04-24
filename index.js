var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var config =require('./config.json');

var promises = [];
var groups = [];
var gitlabUrls = [];

// console.log('获取分组列表...');
for (var i = 1; i <= 7; i++) {
  promises[i] = new Promise(function(resolve, reject) {
    request.get({
      url: config.url + '/explore/groups?page=' + i,
      headers: {
        Cookie: config.cookie
      }
    }, function(error, response, body) {
      $ = cheerio.load(body);

      var doms = $('.group-name strong');

      for (var i = 0; i < doms.length; i++) {
        groups.push(doms[i].children[0].data);
      }

      resolve();
    });
  });
}

Promise.all(promises).then(function() {
  promises = [];

  // console.log('获取项目列表...');
  for (var i = 0; i < groups.length; i++) {
    promises[i] = new Promise(function(resolve, reject) {
      request.get({
        url: config.url + '/groups/' + groups[i],
        headers: {
          Cookie: config.cookie
        }
      }, function(error, response, body) {
        $ = cheerio.load(body);

        var doms = $('.side li .project');

        for (var i = 0; i < doms.length; i++) {
          // console.log('http://gitlab.mogujie.org' + doms[i].attribs.href + '.git');
          gitlabUrls.push('http://gitlab.mogujie.org' + doms[i].attribs.href + '.git');
        }

        resolve();
      });
    });
  }

  Promise.all(promises).then(function() {
    console.log(gitlabUrls);

    var projects = '';

    for (var i = 0; i < gitlabUrls.length; i++) {
      projects += gitlabUrls[i] + '\n';
    }

    fs.writeFileSync('./projects.txt', projects, 'utf-8');
  });
});
