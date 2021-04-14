const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

suite("Functional Tests", function () {
  test("Test 01: Create an issue with every field", done => {
    chai
      .request(server)
      .post("/api/issues/testing")
      .send({
        issue_title: "Title 01",
        issue_text: "Text 01",
        created_by: "HOuadhour",
        assigned_to: "Me",
        status_text: "Status",
      })
      .end((err, res) => {
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.type, "application/json");
        assert.hasAnyKeys(res.body, "_id");
        assert.strictEqual(res.body.open, true);
        assert.strictEqual(res.body.issue_title, "Title 01");

        done();
      });
  });

  test("Test 02: Create an issue with only required fields", done => {
    chai
      .request(server)
      .post("/api/issues/testing")
      .send({
        issue_title: "Title 01",
        issue_text: "Text 01",
        created_by: "HOuadhour",
      })
      .end((err, res) => {
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.type, "application/json");
        assert.hasAnyKeys(res.body, "_id");
        assert.strictEqual(res.body.open, true);
        assert.strictEqual(res.body.issue_title, "Title 01");

        done();
      });
  });

  test("Test 03: Create an issue with missing required fields.", done => {
    chai
      .request(server)
      .post("/api/issues/testing")
      .send({
        issue_title: "Title 01",
      })
      .end((err, res) => {
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.type, "application/json");
        assert.hasAnyKeys(res.body, "error");
        assert.strictEqual(res.body.error, "required field(s) missing");

        done();
      });
  });

  test("Test 04: View issues on a project.", done => {
    chai
      .request(server)
      .get("/api/issues/testing")
      .end((err, res) => {
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.type, "application/json");

        done();
      });
  });

  test("Test 05: View issues on a project with one filter.", done => {
    chai
      .request(server)
      .get("/api/issues/testing?created_by=HOuadhour")
      .end((err, res) => {
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.type, "application/json");

        res.body.forEach(doc => {
          assert.strictEqual(doc.created_by, "HOuadhour");
        });
        done();
      });
  });

  test("Test 06: View issues on a project with multiple filters.", done => {
    chai
      .request(server)
      .get("/api/issues/testing?open=true&created_by=HOuadhour&assigned_to=Me")
      .end((err, res) => {
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.type, "application/json");

        res.body.forEach(doc => {
          assert.strictEqual(doc.created_by, "HOuadhour");
          assert.strictEqual(doc.assigned_to, "Me");
          assert.strictEqual(doc.open, true);
        });
        done();
      });
  });

  test("Test 07: Update one field on an issue.", done => {
    chai
      .request(server)
      .post("/api/issues/testing")
      .send({
        issue_title: "Title to change",
        issue_text: "Text to keep",
        created_by: "Chai",
      })
      .end((err, res) => {
        const { _id, issue_title, issue_text } = res.body;

        chai
          .request(server)
          .put("/api/issues/testing")
          .send({
            _id,
            issue_title: "Title changed",
          })
          .end((err, res) => {
            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.type, "application/json");
            assert.strictEqual(res.body._id, _id);
            assert.strictEqual(res.body.result, "successfully updated");

            chai
              .request(server)
              .get(`/api/issues/testing?_id=${_id}`)
              .end((err, res) => {
                assert.strictEqual(res.status, 200);
                assert.strictEqual(res.type, "application/json");
                assert.strictEqual(res.body[0]._id, _id);
                assert.strictEqual(res.body[0].issue_title, "Title changed");
                assert.strictEqual(res.body[0].issue_text, issue_text);

                done();
              });
          });
      });
  });

  test("Test 08: Update multiple fields on an issue.", done => {
    chai
      .request(server)
      .post("/api/issues/testing")
      .send({
        issue_title: "Title to change",
        issue_text: "Text to keep",
        created_by: "Chai",
      })
      .end((err, res) => {
        const { _id, issue_title, issue_text } = res.body;

        chai
          .request(server)
          .put("/api/issues/testing")
          .send({
            _id,
            issue_title: "Title changed",
            issue_text: "Text changed",
          })
          .end((err, res) => {
            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.type, "application/json");
            assert.strictEqual(res.body._id, _id);
            assert.strictEqual(res.body.result, "successfully updated");

            chai
              .request(server)
              .get(`/api/issues/testing?_id=${_id}`)
              .end((err, res) => {
                assert.strictEqual(res.status, 200);
                assert.strictEqual(res.type, "application/json");
                assert.strictEqual(res.body[0]._id, _id);
                assert.strictEqual(res.body[0].issue_title, "Title changed");
                assert.strictEqual(res.body[0].issue_text, "Text changed");

                done();
              });
          });
      });
  });

  test("Test 09: Update an issue with missing _id.", done => {
    chai
      .request(server)
      .put("/api/issues/testing")
      .send({
        issue_title: "Title changed",
      })
      .end((err, res) => {
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.type, "application/json");
        assert.strictEqual(res.body.error, "missing _id");
        done();
      });
  });

  test("Test 10: Update an issue with no fields to update.", done => {
    chai
      .request(server)
      .post("/api/issues/testing")
      .send({
        issue_title: "Title to change",
        issue_text: "Text to keep",
        created_by: "Chai",
      })
      .end((err, res) => {
        const { _id, issue_title, issue_text } = res.body;

        chai
          .request(server)
          .put("/api/issues/testing")
          .send({
            _id,
          })
          .end((err, res) => {
            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.type, "application/json");
            assert.strictEqual(res.body._id, _id);
            assert.strictEqual(res.body.error, "no update field(s) sent");

            done();
          });
      });
  });

  test("Test 11: Update an issue with an invalid _id.", done => {
    chai
      .request(server)
      .put("/api/issues/testing")
      .send({
        _id: "incorrect id",
        issue_title: "Correct Title",
      })
      .end((err, res) => {
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.type, "application/json");
        assert.strictEqual(res.body.error, "could not update");

        done();
      });
  });

  test("Test 12: Delete an issue.", done => {
    chai
      .request(server)
      .post("/api/issues/testing")
      .send({
        issue_title: "Title to delete",
        issue_text: "Text to keep",
        created_by: "Chai",
      })
      .end((err, res) => {
        const { _id } = res.body;

        chai
          .request(server)
          .delete("/api/issues/testing")
          .send({
            _id,
          })
          .end((err, res) => {
            assert.strictEqual(res.status, 200);
            assert.strictEqual(res.type, "application/json");
            assert.strictEqual(res.body._id, _id);
            assert.strictEqual(res.body.result, "successfully deleted");
          });

        done();
      });
  });

  test("Test 13: Delete an issue with an invalid _id.", done => {
    chai
      .request(server)
      .delete("/api/issues/testing")
      .send({
        _id: "Incorrect id",
      })
      .end((err, res) => {
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.type, "application/json");
        assert.strictEqual(res.body.error, "could not delete");

        done();
      });
  });

  test("Test 14: Delete an issue with missing _id.", done => {
    chai
      .request(server)
      .delete("/api/issues/testing")
      .end((err, res) => {
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.type, "application/json");
        assert.strictEqual(res.body.error, "missing _id");

        done();
      });
  });
});
