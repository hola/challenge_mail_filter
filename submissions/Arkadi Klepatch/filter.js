'use strict';

var
	NONE = [],
	STAR = [];
	
var parseQ = function(pattern, offset) {
	var
		i = 0,
		len1 = (pattern = pattern.split('?')).length,
		len2;
	do
		if ((len2 = pattern[i].length) !== 0) {
			var arr = [pattern[i], offset += i];
			while (++i < len1) {
				offset += len2 + 1;
				if ((len2 = pattern[i].length) !== 0)
					arr.push(pattern[i], offset);
			}
			return arr;

		}
	while (++i < len1);
	return NONE;
};

var parseStarQ = function(pattern) {
	if (pattern.length === 0) //very unlikely
		return [[pattern, 0], NONE, NONE, 0];

	var
		offset = (pattern = pattern.split('*'))[0].length,
		prefix, middle;
	if (offset !== 0) {
		prefix = parseQ(pattern[0], 0);
		middle = NONE;
	} else {
		prefix = NONE;
		middle = STAR;
	}
	var last = pattern.length - 1;
	if (last === 0)
		return [prefix, middle, NONE, offset];

	middle = STAR;
	var len, suffix;
	for (var i = 1; i < last; ++i)
		if ((len = pattern[i].length) !== 0) {
			suffix = parseQ(pattern[i], offset);
			offset += len;
			if (suffix.length !== 0) {
				middle = [suffix];
				while (++i < last)
					if ((len = pattern[i].length) !== 0) {
						if ((suffix = parseQ(pattern[i], offset)).length !== 0)
							middle.push(suffix);
						offset += len;
					}
				break;
			}
		}
	if ((len = pattern[last].length) !== 0) {
		suffix = parseQ(pattern[last], offset);
		offset += len;
	} else
		suffix = NONE;
	return [prefix, middle, suffix, offset];
}

exports.filter = function(messages, rules) {
	var
		results = {}
		, len = rules.length
		, rule
		
		//need to manualy inline everything in the inner loops for speed
		//hence there are many vars and inner loop vars have very short names
		, buf = [] //buffer for preprocessed messages
		, bl //buf.length
		, act //rule.action
		, j //inner loop counter
		, k //inner-inner loop counter
		, l //inner-inner-inner loop counter
		, sf //count of chars matched by stars so far
		, an //anchor position
		
		//from vars
		, mf //message.from
		, f //parseStarQ(rule.from)
		, fl //length estimate
		, fsm //count of chars to be matched by stars
		, fp //prefix
		, fpl //fp.length;
		, fm //middle
		, fml //fm.length;
		, fmk //fm[k]
		, fmkl //fmk.length
		, fs //suffix
		, fsl //fs.length;
		
		//to vars
		, mt //message.to
		, t //parseStarQ(rule.to)
		, tl //length estimate
		, tsm //count of chars to be matched by stars
		, tp //prefix
		, tpl //tp.length;
		, tm //middle
		, tml //tm.length;
		, tmk //tm[k]
		, tmkl //tmk.length
		, ts //to suffix
		, tsl //ts.length;
	;

	//messages to array
	for (var prop in messages)
		buf.push(messages[prop], results[prop] = []);	
	bl = buf.length;

	//parse/apply rule
	for (var i = 0; i !== len; ++i) {		
		rule = rules[i];
		act = rule.action;
		if (rule.from !== void 0) {
			fpl = (fp = (f = parseStarQ(rule.from))[0]).length;
			fl = f[3];
			if ((fm = f[1]) !== NONE) {
				fml = fm.length;
				fsl = (fs = f[2]).length;
				if (rule.to !== void 0) {
					tpl = (tp = (t = parseStarQ(rule.to))[0]).length;
					tl = t[3];
					if ((tm = t[1]) !== NONE) {
						tml = tm.length;
						tsl = (ts = t[2]).length;
						messages: for (j = 0; j !== bl; j += 2) if ((mf = buf[j].from).length >= fl && (mt = buf[j].to).length >= tl) {
							for (k = 0; k !== fpl; ++k) if (!mf.startsWith(fp[k], fp[++k])) continue messages;
							for (k = 0; k !== tpl; ++k) if (!mt.startsWith(tp[k], tp[++k])) continue messages;
							fsm = mf.length - fl;
							stars: for (k = sf = 0; k !== fml; ++k) {
								if ((an = mf.indexOf((fmk = fm[k])[0], fmk[1] + sf)) < 0) continue messages;							
								anchors: for (fmkl = fmk.length;;) {
									if ((sf = an - fmk[1]) > fsm) continue messages;
									for (l = 2; l !== fmkl; ++l) if (!mf.startsWith(fmk[l], fmk[++l] + sf))
										if ((an = mf.indexOf(fmk[0], fmk[1] + sf + 1)) < 0) continue messages; else continue anchors;
									continue stars;
								}
							}
							tsm = mt.length - tl;
							stars: for (k = sf = 0; k !== tml; ++k) {
								if ((an = mt.indexOf((tmk = tm[k])[0], tmk[1] + sf)) < 0) continue messages;
								anchors: for (tmkl = tmk.length;;) {
									if ((sf = an - tmk[1]) > tsm) continue messages;
									for (l = 2; l !== tmkl; ++l) if (!mt.startsWith(tmk[l], tmk[++l] + sf))
										if ((an = mt.indexOf(tmk[0], tmk[1] + sf + 1)) < 0) continue messages; else continue anchors;
									continue stars;
								}
							}
							for (k = 0; k !== fsl; ++k) if (!mf.startsWith(fs[k], fs[++k] + fsm)) continue messages;
							for (k = 0; k !== tsl; ++k) if (!mt.startsWith(ts[k], ts[++k] + tsm)) continue messages;
							buf[j + 1].push(act);
						}
					} else {
						messages: for (j = 0; j !== bl; j += 2) if ((mt = buf[j].to).length === tl && (mf = buf[j].from).length >= fl) {
							for (k = 0; k !== fpl; ++k) if (!mf.startsWith(fp[k], fp[++k])) continue messages;
							for (k = 0; k !== tpl; ++k) if (!mt.startsWith(tp[k], tp[++k])) continue messages;
							fsm = mf.length - fl;
							stars: for (k = sf = 0; k !== fml; ++k) {
								if ((an = mf.indexOf((fmk = fm[k])[0], fmk[1] + sf)) < 0) continue messages;							
								anchors: for (fmkl = fmk.length;;) {
									if ((sf = an - fmk[1]) > fsm) continue messages;
									for (l = 2; l !== fmkl; ++l) if (!mf.startsWith(fmk[l], fmk[++l] + sf))
										if ((an = mf.indexOf(fmk[0], fmk[1] + sf + 1)) < 0) continue messages; else continue anchors;
									continue stars;
								}
							}
							for (k = 0; k !== fsl; ++k) if (!mf.startsWith(fs[k], fs[++k] + fsm)) continue messages;
							buf[j + 1].push(act);
						}
					}
				} else {
					messages: for (j = 0; j !== bl; j += 2) if ((mf = buf[j].from).length >= fl) {
						for (k = 0; k !== fpl; ++k) if (!mf.startsWith(fp[k], fp[++k])) continue messages;
						fsm = mf.length - fl;						
						stars: for (k = sf = 0; k !== fml; ++k) {
							if ((an = mf.indexOf((fmk = fm[k])[0], fmk[1] + sf)) < 0) continue messages;							
							anchors: for (fmkl = fmk.length;;) {
								if ((sf = an - fmk[1]) > fsm) continue messages;
								for (l = 2; l !== fmkl; ++l) if (!mf.startsWith(fmk[l], fmk[++l] + sf))
									if ((an = mf.indexOf(fmk[0], fmk[1] + sf + 1)) < 0) continue messages; else continue anchors;
								continue stars;
							}
						}
						for (k = 0; k !== fsl; ++k) if (!mf.startsWith(fs[k], fs[++k] + fsm)) continue messages;
						buf[j + 1].push(act);
					}
				}
			} else {
				if (rule.to !== void 0) {
					tpl = (tp = (t = parseStarQ(rule.to))[0]).length;
					tl = t[3];
					if ((tm = t[1]) !== NONE) {
						tml = tm.length;
						tsl = (ts = t[2]).length;
						messages: for (j = 0; j !== bl; j += 2) if ((mf = buf[j].from).length === fl && (mt = buf[j].to).length >= tl) {
							for (k = 0; k !== fpl; ++k) if (!mf.startsWith(fp[k], fp[++k])) continue messages;
							for (k = 0; k !== tpl; ++k) if (!mt.startsWith(tp[k], tp[++k])) continue messages;
							tsm = mt.length - tl;
							stars: for (k = sf = 0; k !== tml; ++k) {
								if ((an = mt.indexOf((tmk = tm[k])[0], tmk[1] + sf)) < 0) continue messages;
								anchors: for (tmkl = tmk.length;;) {
									if ((sf = an - tmk[1]) > tsm) continue messages;
									for (l = 2; l !== tmkl; ++l) if (!mt.startsWith(tmk[l], tmk[++l] + sf))
										if ((an = mt.indexOf(tmk[0], tmk[1] + sf + 1)) < 0) continue messages; else continue anchors;
									continue stars;
								}
							}
							for (k = 0; k !== tsl; ++k) if (!mt.startsWith(ts[k], ts[++k] + tsm)) continue messages;
							buf[j + 1].push(act);
						}
					} else {
						messages: for (j = 0; j !== bl; j += 2) if ((mf = buf[j].from).length === fl && (mt = buf[j].to).length === tl) {
							for (k = 0; k !== fpl; ++k) if (!mf.startsWith(fp[k], fp[++k])) continue messages;
							for (k = 0; k !== tpl; ++k) if (!mt.startsWith(tp[k], tp[++k])) continue messages;
							buf[j + 1].push(act);
						}
					}
				} else {
					messages: for (j = 0; j !== bl; j += 2) if ((mf = buf[j].from).length === fl) {
						for (k = 0; k !== fpl; ++k) if (!mf.startsWith(fp[k], fp[++k])) continue messages;
						buf[j + 1].push(act);
					}
				}
			}
		} else if (rule.to !== void 0) {
			tpl = (tp = (t = parseStarQ(rule.to))[0]).length;
			tl = t[3];
			if ((tm = t[1]) !== NONE) {
				tml = tm.length;
				tsl = (ts = t[2]).length;
				messages: for (j = 0; j !== bl; j += 2) if ((mt = buf[j].to).length >= tl) {
					for (k = 0; k !== tpl; ++k) if (!mt.startsWith(tp[k], tp[++k])) continue messages;
					tsm = mt.length - tl;
					stars: for (k = sf = 0; k !== tml; ++k) {
						if ((an = mt.indexOf((tmk = tm[k])[0], tmk[1] + sf)) < 0) continue messages;
						anchors: for (tmkl = tmk.length;;) {
							if ((sf = an - tmk[1]) > tsm) continue messages;
							for (l = 2; l !== tmkl; ++l) if (!mt.startsWith(tmk[l], tmk[++l] + sf))
								if ((an = mt.indexOf(tmk[0], tmk[1] + sf + 1)) < 0) continue messages; else continue anchors;
							continue stars;
						}
					}
					for (k = 0; k !== tsl; ++k) if (!mt.startsWith(ts[k], ts[++k] + tsm)) continue messages;
					buf[j + 1].push(act);
				}
			} else {
				messages: for (j = 0; j !== bl; j += 2) if ((mt = buf[j].to).length === tl) {
					for (k = 0; k !== tpl; ++k) if (!mt.startsWith(tp[k], tp[++k])) continue messages;
					buf[j + 1].push(act);
				}
			}
		} else
			for (j = 1; j < bl; j += 2) buf[j].push(act);
	}
	
	return results;
};
