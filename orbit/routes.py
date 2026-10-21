
from flask import Blueprint, render_template, request, redirect, url_for, flash
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash

from orbit import db
from orbit.models import User

main = Blueprint("main", __name__)


@main.route("/")
def index():
    if current_user.is_authenticated:
        return redirect(url_for("main.dashboard"))
    return redirect(url_for("main.login"))


@main.route("/register", methods=["GET", "POST"])
def register():
    if current_user.is_authenticated:
        return redirect(url_for("main.dashboard"))

    if request.method == "POST":
        username = request.form.get("username", "").strip()
        email = request.form.get("email", "").strip().lower()
        password = request.form.get("password", "")
        confirm_password = request.form.get("confirm_password", "")

        if not username or not email or not password:
            flash("모든 항목을 입력해 주세요.", "error")
        elif password != confirm_password:
            flash("비밀번호가 서로 일치하지 않습니다.", "error")
        elif len(password) < 8:
            flash("비밀번호는 8자 이상이어야 합니다.", "error")
        elif User.query.filter_by(email=email).first():
            flash("이미 가입된 이메일입니다.", "error")
        else:
            user = User(
                username=username,
                email=email,
                password_hash=generate_password_hash(password)
            )
            db.session.add(user)
            db.session.commit()

            login_user(user)
            flash("회원가입이 완료되었습니다!", "success")
            return redirect(url_for("main.dashboard"))

    return render_template("register.html")


@main.route("/login", methods=["GET", "POST"])
def login():
    if current_user.is_authenticated:
        return redirect(url_for("main.dashboard"))

    if request.method == "POST":
        email = request.form.get("email", "").strip().lower()
        password = request.form.get("password", "")

        user = User.query.filter_by(email=email).first()

        if user and check_password_hash(user.password_hash, password):
            login_user(user)
            flash("로그인되었습니다!", "success")
            return redirect(url_for("main.dashboard"))

        flash("이메일 또는 비밀번호를 확인해 주세요.", "error")

    return render_template("login.html")


@main.route("/logout")
@login_required
def logout():
    logout_user()
    flash("로그아웃되었습니다.", "success")
    return redirect(url_for("main.login"))


@main.route("/dashboard")
@login_required
def dashboard():
    return render_template("dashboard.html")

