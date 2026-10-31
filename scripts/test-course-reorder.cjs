const fs = require("node:fs");
const vm = require("node:vm");
const assert = require("node:assert/strict");
const ts = require("typescript");

const compiled = ts.transpileModule(
    fs.readFileSync("app/api/admin/courses/reorder/route.ts", "utf8"),
    { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017 } }
).outputText;
const a = "00000000-0000-4000-8000-000000000001";
const b = "00000000-0000-4000-8000-000000000002";
const foreign = "00000000-0000-4000-8000-000000000003";

async function check(role, ids, expected, conflict = false) {
    const updates = [], revalidated = [];
    const exports = {};
    const db = {
        $transaction: async (fn, options) => {
            assert.equal(options.isolationLevel, "Serializable");
            if (conflict) throw { code: "P2034" };
            return fn({ course: {
                findMany: async args => {
                    assert.equal(args.where.userId, "owner");
                    return [{ id: a }, { id: b }];
                },
                update: async args => updates.push(args),
            } });
        },
    };
    vm.runInNewContext(compiled, { exports, console, require: name => {
        if (name === "next/server") return { NextResponse: class extends Response {
            static json(value) { return Response.json(value); }
        } };
        if (name === "next-auth") return { getServerSession: async () => role ? { user: { id: "owner", role } } : null };
        if (name === "next/cache") return { revalidatePath: path => revalidated.push(path) };
        if (name === "@/lib/auth") return { authOptions: {} };
        if (name === "@/lib/db") return { db };
        if (name === "zod") return require("zod");
        throw Error(name);
    } });
    const response = await exports.PATCH({ json: async () => ({ courseIds: ids }) });
    assert.equal(response.status, expected);
    if (expected === 200) {
        assert.equal(updates.length, 2);
        assert.equal(updates[0].where.id, b);
        assert.equal(updates[0].where.userId, "owner");
        assert.equal(updates[0].data.position, 1);
        assert.equal(updates[1].where.id, a);
        assert.equal(updates[1].data.position, 2);
        assert.equal(revalidated.length, 4);
    } else {
        assert.equal(updates.length, 0);
        assert.equal(revalidated.length, 0);
    }
}

(async () => {
    await check(null, [b, a], 401);
    await check("STUDENT", [b, a], 403);
    await check("ADMIN_ASSISTANT", [b, a], 403);
    await check("ADMIN", [], 400);
    await check("ADMIN", [a, a], 400);
    await check("ADMIN", ["invalid"], 400);
    await check("ADMIN", [foreign, a], 403);
    await check("ADMIN", [a], 409);
    await check("ADMIN", [b, a], 409, true);
    await check("ADMIN", [b, a], 200);
    console.log("Passed 10 course reorder checks.");
})().catch(error => { console.error(error); process.exitCode = 1; });
