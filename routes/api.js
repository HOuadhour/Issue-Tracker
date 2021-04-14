"use strict";
const router = require("express").Router();
const connect = require("../db");
const { ObjectID } = require("mongodb");

module.exports = () => router;

connect().then(issues => {
  router.get("/:project", async (req, res, next) => {
    const { project } = req.params;

    const filters = {};

    for (const filter in req.query) {
      if (filter == "_id") {
        filters._id = ObjectID(req.query._id);
      } else if (filter == "open") {
        filters.open =
          req.query.open == "true"
            ? true
            : req.query.open == "false"
            ? false
            : req.query.open;
      } else {
        filters[filter] = req.query[filter];
      }
    }
    const docs = await issues
      .find({ project, ...filters }, { projection: { project: 0 } })
      .toArray();

    res.json(docs);
  });
  router.post("/:project", async (req, res, next) => {
    const { project } = req.params;
    const {
      issue_title,
      issue_text,
      created_by,
      assigned_to,
      status_text,
    } = req.body;

    if (!issue_title || !issue_text || !created_by)
      res.json({
        error: "required field(s) missing",
      });
    else {
      const currentDate = new Date();
      const data = {
        issue_title,
        issue_text,
        created_by,
        assigned_to: assigned_to || "",
        status_text: status_text || "",
        open: true,
        created_on: currentDate,
        updated_on: currentDate,
        project,
      };
      const doc = await issues.insertOne(data);
      const id = doc.insertedId;
      const result = await issues.findOne(
        { _id: ObjectID(id) },
        { projection: { project: 0 } }
      );
      res.json(result);
    }
  });

  router.put("/:project", async (req, res) => {
    const { project } = req.params;
    const { _id, open } = req.body;
    const properties = [
      "issue_text",
      "issue_title",
      "created_by",
      "assigned_to",
      "status_text",
    ];
    let propertyExisted = true;
    if (!_id) {
      res.json({
        error: "missing _id",
      });
    } else {
      if (
        properties.some(prop => {
          return req.body.hasOwnProperty(prop);
        })
      ) {
        const currentDate = new Date();
        try {
          const old = await issues.findOne({ _id: ObjectID(_id) });
          const doc = await issues.updateOne(
            { _id: ObjectID(_id) },
            {
              $set: {
                issue_text:
                  req.body.issue_text === undefined
                    ? old.issue_text
                    : req.body.issue_text,
                issue_title:
                  req.body.issue_title === undefined
                    ? old.issue_title
                    : req.body.issue_title,
                created_by:
                  req.body.created_by === undefined
                    ? old.created_by
                    : req.body.created_by,
                assigned_to:
                  req.body.created_by === undefined
                    ? old.created_by
                    : req.body.created_by,
                status_text:
                  req.body.status_text === undefined
                    ? old.status_text
                    : req.body.status_text,
                open:
                  req.body.open === undefined ? true : Boolean(req.body.open),
                updated_on: currentDate,
              },
            }
          );
          if (doc.modifiedCount === 1) {
            res.json({ result: "successfully updated", _id });
          } else {
            res.json({
              error: "could not update",
              _id,
            });
          }
        } catch (err) {
          if (
            String(err).match(
              /Error: Argument passed in must be a single String|TypeError/g
            )
          ) {
            res.status(404).json({
              error: "invalid id",
            });
          } else {
            console.error(err);
          }
        }
      } else {
        res.json({
          error: "no update field(s) sent",
          _id,
        });
      }
    }
  });

  router.delete("/:project", async (req, res) => {
    const { project } = req.params;
    const { _id } = req.body;

    if (!_id) {
      res.json({
        error: "missing _id",
      });
    } else {
      try {
        const deleted = await issues.deleteOne({ _id: ObjectID(_id) });

        if (deleted.deletedCount === 1) {
          res.json({ result: "successfully deleted", _id });
        } else {
          res.json({ error: "could not delete", _id });
        }
      } catch (err) {
        if (
          String(err).match(
            /Error: Argument passed in must be a single String/g
          )
        ) {
          res.status(404).json({
            error: "invalid id",
          });
        } else {
          console.error(err);
        }
      }
    }
  });
});
