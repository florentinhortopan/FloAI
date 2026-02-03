export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set([]),
	mimeTypes: {},
	_: {
		client: {start:"_app/immutable/entry/start.hkYP_X4g.js",app:"_app/immutable/entry/app.CXxEQGfj.js",imports:["_app/immutable/entry/start.hkYP_X4g.js","_app/immutable/chunks/BfgjPuXB.js","_app/immutable/chunks/CgT0rgf2.js","_app/immutable/entry/app.CXxEQGfj.js","_app/immutable/chunks/CgT0rgf2.js","_app/immutable/chunks/C6B6ZOh-.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('../output/server/nodes/0.js')),
			__memo(() => import('../output/server/nodes/1.js')),
			__memo(() => import('../output/server/nodes/2.js')),
			__memo(() => import('../output/server/nodes/3.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/admin",
				pattern: /^\/admin\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			},
			{
				id: "/api/admin/analytics",
				pattern: /^\/api\/admin\/analytics\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/admin/analytics/_server.ts.js'))
			},
			{
				id: "/api/admin/export",
				pattern: /^\/api\/admin\/export\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/admin/export/_server.ts.js'))
			},
			{
				id: "/api/admin/knowledge",
				pattern: /^\/api\/admin\/knowledge\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/admin/knowledge/_server.ts.js'))
			},
			{
				id: "/api/admin/sessions",
				pattern: /^\/api\/admin\/sessions\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/admin/sessions/_server.ts.js'))
			},
			{
				id: "/api/chat",
				pattern: /^\/api\/chat\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/chat/_server.ts.js'))
			},
			{
				id: "/api/newsletter/subscribe",
				pattern: /^\/api\/newsletter\/subscribe\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/newsletter/subscribe/_server.ts.js'))
			},
			{
				id: "/api/parse-job",
				pattern: /^\/api\/parse-job\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/parse-job/_server.ts.js'))
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
