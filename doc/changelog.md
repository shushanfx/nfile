# Change logs for nfile

## 2017-11-24
* Add a new page for view(`/view`)
* Change the `/index` to `/edit`

## 2017-08-04
* Add path selector for list page.
* Mapping `/` to `/list`, other than `/index`, so it will present **file list** page default.
* Support a embed html snippet in markdown file, this can be forbidden in `server.json`
* Support ci in [travis ci](https://travis-ci.org/)

## 2017-06-01
* Add prefix support for file system. when you embed nfile into another system, just config the base parameter.

## 2017-05-26
* Fix bugs for calculating modified time of the file.
* Add back-to-top button for file list page.

## 2017-05-25
* Add page /file/list to list upload files, only html/md/ppt/word files can be recongnised.
* Add page /tag/* and /tag-cloud

## 2017-05-17
* Fix bugs for ie ajax request. In ie, ajax request cannot be recongnised because of `application/json`.
* Add a middle ware for ie, you can use req.isIE and res.isIE to check whether the request comes from an ie browser.

## some day
* Init commit, which the date I can't remember.
